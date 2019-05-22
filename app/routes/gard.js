var querystring = require("querystring"),
  error = require(__dirname + " /../../lib/error.js"),
  globals = require(__dirname + "/../../config/globals.js"),
  mailer = require(__dirname + "/../../lib/mailer.js"),
  helpers = require(__dirname + "/../../lib/helpers.js"),
  hpcsocket = require(__dirname + "/../../lib/hpcsocket.js"),
  fs = require("fs"),
  path = require("path"),
  logger = require("../../lib/logger"),
  setup = require(__dirname + "/../../config/setup.js");

var mongoose = require("mongoose"),
  Msa = mongoose.model("Msa"),
  Sequences = mongoose.model("Sequences"),
  PartitionInfo = mongoose.model("PartitionInfo"),
  GARD = mongoose.model("GARD");

var redis = require("redis"),
  client = redis.createClient({ host: setup.redisHost, port: setup.redisPort });

exports.form = function(req, res) {
  var post_to = "/gard";
  res.render("gard/form.ejs", { post_to: post_to });
};

exports.invoke = function(req, res) {
  var connect_callback = function(data) {
    if (data == "connected") {
      logger.log("connected");
    }
  };

  var fn = req.files.files.file,
    gard = new GARD(),
    postdata = req.body,
    datatype = postdata.datatype,
    gencodeid = postdata.gencodeid,
    site_to_site_variation = postdata.site_to_site_variation,
    rate_classes = postdata.rate_classes;

  gard.site_to_site_variation = site_to_site_variation;
  gard.rate_classes = rate_classes;

  gard.mail = postdata.mail;

  Msa.parseFile(fn, datatype, gencodeid, function(err, msa) {
    if (err) {
      res.json(500, { error: err });
      return;
    }

    // Check if msa exceeds limitations
    if (msa.sites > gard.max_sites) {
      var error =
        "Site limit exceeded! Sites must be less than " + gard.max_sites;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    if (msa.sequences > gard.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        gard.max_sequences;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    gard.msa = msa;

    gard.status = gard.status_stack[0];

    gard.save(function(err, gard_result) {
      if (err) {
        logger.error("gard save failed");
        res.json(500, { error: err });
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error("gard rename failed");
          res.json(500, { error: err });
        } else {
          var to_send = gard;
          to_send.upload_redirect_path = gard.upload_redirect_path;
          res.json(200, {
            analysis: gard,
            upload_redirect_path: gard.upload_redirect_path
          });

          // Send the MSA and analysis type
          GARD.submitJob(gard_result, connect_callback);
        }
      }

      helpers.moveSafely(req.files.files.file, gard_result.filepath, move_cb);
    });
  });
};

exports.getPage = function(req, res) {
  // Find the analysis
  var gardid = req.params.id;

  //Return all results
  GARD.findOne({ _id: gardid }, function(err, gard) {
    if (err || !gard) {
      res.json(500, error.errorResponse("Invalid ID : " + gardid));
    } else {
      // Should return results page
      res.render("gard/jobpage.ejs", { job: gard });
    }
  });
};

/**
 * Returns log txt file
 * app.get('/gard/:id/results', gard.getLog);
 */
exports.getLog = function(req, res) {
  var id = req.params.id;

  //Return all results
  GARD.findOne({ _id: id }, function(err, gard) {
    if (err || !busted) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      res.set({ "Content-Disposition": 'attachment; filename="log.txt"' });
      res.set({ "Content-type": "text/plain" });
      res.send(gard.last_status_msg);
    }
  });
};

/**
 * cancels existing job
 * app.get('/busted/:id/cancel', gard.cancel);
 */
exports.cancel = function(req, res) {
  var id = req.params.id;

  //Return all results
  GARD.findOne({ _id: id }, function(err, gard) {
    if (err || !busted) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      gard.cancel(function(err, success) {
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
  GARD.subscribePendingJobs();
};

exports.getMSAFile = function(req, res) {
  var id = req.params.id,
    name = req.params.name;

  var options = {};

  GARD.findOne({ _id: id }, function(err, gard) {
    res.sendFile(gard.filepath, options, function(err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  });
};

exports.fasta = function(req, res) {
  var id = req.params.id;

  GARD.findOne({ _id: id }, function(err, gard) {
    if (err || !gard) {
      winston.info(err);
      res.json(500, error.errorReponse("invalid id : " + id));
    }
    Msa.deliverFasta(gard.filepath)
      .then(value => {
        res.json(200, { fasta: value });
      })
      .catch(err => {
        winston.info(err);
        res.json(500, { error: "Unable to deliver fasta." });
      });
  });
};

exports.getScreenedData = function(req, res) {
  var id = req.params.id,
    file_path = path.join(
      __dirname,
      "..",
      "..",
      "uploads",
      "msa",
      id + ".gard.result.nex"
    );
  res.download(file_path, "screened_data.nex");
};

exports.getUsage = function(req, res) {
  client.get(GARD.cachePath(), function(err, data) {
    try {
      res.json(200, JSON.parse(data));
    } catch (err) {
      winston.info(err);
    }
  });
};
