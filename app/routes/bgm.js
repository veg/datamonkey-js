var querystring = require("querystring"),
  error = require(__dirname + " /../../lib/error.js"),
  globals = require(__dirname + "/../../config/globals.js"),
  mailer = require(__dirname + "/../../lib/mailer.js"),
  helpers = require(__dirname + "/../../lib/helpers.js"),
  hpcsocket = require(__dirname + "/../../lib/hpcsocket.js"),
  fs = require("fs"),
  winston = require("winston"),
  logger = require("../../lib/logger");

var mongoose = require("mongoose"),
  Msa = mongoose.model("Msa"),
  Sequences = mongoose.model("Sequences"),
  PartitionInfo = mongoose.model("PartitionInfo"),
  BGM = mongoose.model("BGM");

var redis = require("redis"),
  client = redis.createClient({ host: "localhost", port: 6379 });

exports.form = function(req, res) {
  var post_to = "/bgm";
  res.render("bgm/form.ejs", { post_to: post_to });
};

exports.invoke = function(req, res) {
  var connect_callback = function(data) {
    if (data == "connected") {
      logger.log("connected");
    }
  };

  var fn = req.files.files.file,
    bgm = new BGM(),
    postdata = req.body,
    datatype = 0,
    gencodeid = postdata.gencodeid;

  if (postdata.receive_mail == "true") {
    bgm.mail = postdata.mail;
  }

  Msa.parseFile(fn, datatype, gencodeid, function(err, msa) {
    if (err) {
      res.json(500, { error: err });
      return;
    }

    // Check if msa exceeds limitations
    if (msa.sites > bgm.max_sites) {
      var error =
        "Site limit exceeded! Sites must be less than " + bgm.max_sites;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    if (msa.sequences > bgm.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        bgm.max_sequences;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    bgm.msa = msa;

    bgm.status = bgm.status_stack[0];
    bgm.length_of_each_chain = postdata.length_of_each_chain;
    bgm.number_of_burn_in_samples = postdata.number_of_burn_in_samples;
    bgm.number_of_samples = postdata.number_of_samples;
    bgm.maximum_parents_per_node = postdata.maximum_parents_per_node;
    bgm.minimum_subs_per_site = postdata.minimum_subs_per_site;

    bgm.save(function(err, bgm_result) {
      if (err) {
        logger.error("bgm save failed");
        res.json(500, { error: err });
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error("bgm rename failed");
          res.json(500, { error: err });
        } else {
          var to_send = bgm;
          to_send.upload_redirect_path = bgm.upload_redirect_path;
          res.json(200, {
            analysis: bgm,
            upload_redirect_path: bgm.upload_redirect_path
          });

          // Send the MSA and analysis type
          BGM.submitJob(bgm_result, connect_callback);
        }
      }

      helpers.moveSafely(req.files.files.file, bgm_result.filepath, move_cb);
    });
  });
};

exports.getPage = function(req, res) {
  // Find the analysis
  var bgmid = req.params.id;

  //Return all results
  BGM.findOne({ _id: bgmid }, function(err, bgm) {
    if (err || !bgm) {
      res.json(500, error.errorResponse("Invalid ID : " + bgmid));
    } else {
      // Should return results page
      res.render("bgm/jobpage.ejs", { job: bgm });
    }
  });
};

exports.getResults = function(req, res) {
  var bgmid = req.params.id;
  BGM.findOne({ _id: bgmid }, function(err, bgm) {
    if (err || !bgm) {
      res.json(500, error.errorResponse("invalid id : " + bgmid));
    } else {
      // Should return results page
      // Append PMID to results
      var bgm_results = JSON.parse(bgm.results);
      bgm_results["PMID"] = bgm.pmid;
      res.json(200, bgm_results);
    }
  });
};

exports.getInfo = function(req, res) {
  var id = req.params.id;

  //Return all results
  BGM.findOne(
    { _id: id },
    { creation_time: 1, start_time: 1, status: 1 },
    function(err, bgm_info) {
      if (err || !bgm_info) {
        res.json(500, error.errorResponse("Invalid ID : " + id));
      } else {
        // Should return results page
        res.json(200, bgm_info);
      }
    }
  );
};

exports.getLog = function(req, res) {
  var id = req.params.id;

  //Return all results
  BGM.findOne({ _id: id }, function(err, bgm) {
    if (err || !bgm) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      res.set({ "Content-Disposition": 'attachment; filename="log.txt"' });
      res.set({ "Content-type": "text/plain" });
      res.send(bgm.last_status_msg);
    }
  });
};

/**
 * cancels existing job
 * app.get('/busted/:id/cancel', meme.cancel);
 */
exports.cancel = function(req, res) {
  var id = req.params.id;

  //Return all results
  BGM.findOne({ _id: id }, function(err, bgm) {
    if (err || !bgm) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      bgm.cancel(function(err, success) {
        if (success) {
          res.json(200, { success: "yes" });
        } else {
          res.json(500, { success: "no" });
        }
      });
    }
  });
};

exports.resubscribePendingJobs = function(req, res) {
  BGM.subscribePendingJobs();
};

exports.getMSAFile = function(req, res) {
  var id = req.params.id,
    name = req.params.name;

  var options = {};

  BGM.findOne({ _id: id }, function(err, bgm) {
    res.sendFile(bgm.filepath, options, function(err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  });
};

exports.fasta = function(req, res) {
  var id = req.params.id;

  BGM.findOne({ _id: id }, function(err, bgm) {
    if (err || !bgm) {
      winston.info(err);
      res.json(500, error.errorReponse("invalid id : " + id));
    }
    Msa.deliverFasta(bgm.filepath)
      .then(value => {
        res.json(200, { fasta: value });
      })
      .catch(err => {
        winston.info(err);
        res.json(500, { error: "Unable to deliver fasta." });
      });
  });
};

exports.getUsage = function(req, res) {
  client.get(BGM.cachePath(), function(err, data) {
    try {
      res.json(200, JSON.parse(data));
    } catch (err) {
      winston.info(err);
    }
  });
};
