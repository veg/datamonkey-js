var querystring = require("querystring"),
  error = require(__dirname + " /../../lib/error.js"),
  globals = require(__dirname + "/../../config/globals.js"),
  mailer = require(__dirname + "/../../lib/mailer.js"),
  helpers = require(__dirname + "/../../lib/helpers.js"),
  hpcsocket = require(__dirname + "/../../lib/hpcsocket.js"),
  fs = require("fs"),
  logger = require("../../lib/logger"),
  setup = require(__dirname + "/../../config/setup.js");

var mongoose = require("mongoose"),
  Msa = mongoose.model("Msa"),
  Sequences = mongoose.model("Sequences"),
  PartitionInfo = mongoose.model("PartitionInfo"),
  MULTIHIT = mongoose.model("MULTIHIT");

var redis = require("redis"),
  client = redis.createClient({ host: setup.redisHost, port: setup.redisPort });

exports.form = function(req, res) {
  var post_to = "/multihit";
  res.render("multihit/form.ejs", { post_to: post_to });
};

exports.invoke = function(req, res) {
  var connect_callback = function(data) {
    if (data == "connected") {
      logger.log("connected");
    }
  };

  var fn = req.files.files.file,
    multihit = new MULTIHIT(),
    postdata = req.body;

  multihit.datatype = 0;
  multihit.gencodeid = postdata.gencodeid;
  multihit.rate_classes = postdata.rate_classes;
  multihit.triple_islands = postdata.triple_islands;
  multihit.mail = postdata.mail;

  Msa.parseFile(fn, multihit.datatype, multihit.gencodeid, function(err, msa) {
    if (err) {
      res.json(500, { error: err });
      return;
    }

    // Check if msa exceeds limitations
    if (msa.sites > multihit.max_sites) {
      var error =
        "Site limit exceeded! Sites must be less than " + multihit.max_sites;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    if (msa.sequences > multihit.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        multihit.max_sequences;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    multihit.msa = msa;
    multihit.status = multihit.status_stack[0];

    multihit.save(function(err, multihit_result) {
      if (err) {
        logger.error("multihit save failed");
        res.json(500, { error: err });
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error("multihit rename failed");
          res.json(500, { error: err });
        } else {
          var move = Msa.removeTreeFromFile(
            multihit_result.filepath,
            multihit_result.filepath
          );
          move.then(
            val => {
              res.json(200, {
                analysis: multihit,
                upload_redirect_path: multihit.upload_redirect_path
              });
              MULTIHIT.submitJob(multihit_result, connect_callback);
            },
            reason => {
              res.json(500, { error: "issue removing tree from file" });
            }
          );
        }
      }

      helpers.moveSafely(
        req.files.files.file,
        multihit_result.filepath,
        move_cb
      );
    });
  });
};

exports.getPage = function(req, res) {
  // Find the analysis
  var multihitid = req.params.id;

  //Return all results
  MULTIHIT.findOne({ _id: multihitid }, function(err, multihit) {
    if (err || !multihit) {
      res.json(500, error.errorResponse("Invalid ID : " + multihitid));
    } else {
      // Should return results page
      res.render("multihit/jobpage.ejs", { job: multihit });
    }
  });
};

/**
 * Returns log txt file
 * app.get('/multihit/:id/results', multihit.getLog);
 */
exports.getLog = function(req, res) {
  var id = req.params.id;

  //Return all results
  MULTIHIT.findOne({ _id: id }, function(err, multihit) {
    if (err || !multihit) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      res.set({ "Content-Disposition": 'attachment; filename="log.txt"' });
      res.set({ "Content-type": "text/plain" });
      res.send(multihit.last_status_msg);
    }
  });
};

/**
 * cancels existing job
 * app.get('/multihit/:id/cancel', multihit.cancel);
 */
exports.cancel = function(req, res) {
  var id = req.params.id;

  //Return all results
  MULTIHIT.findOne({ _id: id }, function(err, multihit) {
    if (err || !multihit) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      multihit.cancel(function(err, success) {
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
  MULTIHIT.subscribePendingJobs();
};

exports.getMSAFile = function(req, res) {
  var id = req.params.id,
    name = req.params.name;

  var options = {};

  MULTIHIT.findOne({ _id: id }, function(err, multihit) {
    res.sendFile(multihit.filepath, options, function(err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  });
};

exports.fasta = function(req, res) {
  var id = req.params.id;

  MULTIHIT.findOne({ _id: id }, function(err, multihit) {
    if (err || !multihit) {
      winston.info(err);
      res.json(500, error.errorReponse("invalid id : " + id));
    }
    Msa.deliverFasta(multihit.filepath)
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
  client.get(MULTIHIT.cachePath(), function(err, data) {
    try {
      res.json(200, JSON.parse(data));
    } catch (err) {
      winston.info(err);
    }
  });
};
