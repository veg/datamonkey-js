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
  MEME = mongoose.model("MEME");

var redis = require("redis"),
  client = redis.createClient({ host: setup.redisHost, port: setup.redisPort });

exports.form = function(req, res) {
  var post_to = "/meme";
  res.render("meme/form.ejs", { post_to: post_to });
};

exports.invoke = function(req, res) {
  var connect_callback = function(data) {
    if (data == "connected") {
      logger.log("connected");
    }
  };

  var fn = req.files.files.file,
    meme = new MEME(),
    postdata = req.body,
    datatype = 0,
    gencodeid = postdata.gencodeid;

  meme.mail = postdata.mail;

  Msa.parseFile(fn, datatype, gencodeid, function(err, msa) {
    if (err) {
      res.json(500, { error: err });
      return;
    }

    // Check if msa exceeds limitations
    if (msa.sites > meme.max_sites) {
      var error =
        "Site limit exceeded! Sites must be less than " + meme.max_sites;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    if (msa.sequences > meme.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        meme.max_sequences;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    meme.msa = msa;

    meme.status = meme.status_stack[0];

    meme.save(function(err, meme_result) {
      if (err) {
        logger.error("meme save failed");
        res.json(500, { error: err });
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error("meme rename failed");
          res.json(500, { error: err });
        } else {
          var to_send = meme;
          to_send.upload_redirect_path = meme.upload_redirect_path;
          res.json(200, {
            analysis: meme,
            upload_redirect_path: meme.upload_redirect_path
          });

          // Send the MSA and analysis type
          MEME.submitJob(meme_result, connect_callback);
        }
      }

      helpers.moveSafely(req.files.files.file, meme_result.filepath, move_cb);
    });
  });
};

exports.getPage = function(req, res) {
  // Find the analysis
  var memeid = req.params.id;

  //Return all results
  MEME.findOne({ _id: memeid }, function(err, meme) {
    if (err || !meme) {
      res.json(500, error.errorResponse("Invalid ID : " + memeid));
    } else {
      // Should return results page
      res.render("meme/jobpage.ejs", { job: meme });
    }
  });
};

/**
 * Returns log txt file
 * app.get('/meme/:id/results', meme.getLog);
 */
exports.getLog = function(req, res) {
  var id = req.params.id;

  //Return all results
  MEME.findOne({ _id: id }, function(err, meme) {
    if (err || !busted) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      res.set({ "Content-Disposition": 'attachment; filename="log.txt"' });
      res.set({ "Content-type": "text/plain" });
      res.send(meme.last_status_msg);
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
  MEME.findOne({ _id: id }, function(err, meme) {
    if (err || !busted) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      meme.cancel(function(err, success) {
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
  MEME.subscribePendingJobs();
};

exports.getMSAFile = function(req, res) {
  var id = req.params.id,
    name = req.params.name;

  var options = {};

  MEME.findOne({ _id: id }, function(err, meme) {
    res.sendFile(meme.filepath, options, function(err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  });
};

exports.fasta = function(req, res) {
  var id = req.params.id;

  MEME.findOne({ _id: id }, function(err, meme) {
    if (err || !meme) {
      winston.info(err);
      res.json(500, error.errorReponse("invalid id : " + id));
    }
    Msa.deliverFasta(meme.filepath)
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
  client.get(MEME.cachePath(), function(err, data) {
    try {
      res.json(200, JSON.parse(data));
    } catch (err) {
      winston.info(err);
    }
  });
};
