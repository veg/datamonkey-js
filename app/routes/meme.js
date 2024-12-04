var error = require(__dirname + " /../../lib/error.js"),
  logger = require("../../lib/logger"),
  _ = require("lodash"),
  setup = require(__dirname + "/../../config/setup.js");

var mongoose = require("mongoose"),
  Msa = mongoose.model("Msa"),
  MEME = mongoose.model("MEME");

var redis = require("redis"),
  client = redis.createClient({ host: setup.redisHost, port: setup.redisPort });

exports.form = function (req, res) {
  var post_to = "/meme";
  res.render("meme/form.ejs", { post_to: post_to });
};

exports.invoke = function (req, res) {
  var fn = req.files.files.file;
  let postdata = req.body;

  let options = {
    datatype: 0,
    gencodeid: postdata.gencodeid,
    mail: postdata.mail,
    multiple_hits: postdata.multiple_hits,
    site_multihit: postdata.site_multihit,
    rates: parseInt(postdata.rates),
    resample: parseInt(postdata.resample || 0),
    impute_states: postdata.impute_states,
  };

  //// Check advanced options
  //if (!_.isNaN(resample)) {
  //  options.resample = resample;
  //  options.bootstrap = true;
  //} else {
  //  options.bootstrap = false;
  //}

  MEME.spawn(fn, options, function (err, result) {
    if (err) {
      logger.warn("Error with spawning job from browser :: " + err);
      res.json(200, {
        analysis: { error: err },
        error: err,
      });
      return;
    }

    let upload_redirect_path = "";

    if (result) {
      upload_redirect_path = result.upload_redirect_path;
    }

    res.json(200, {
      analysis: result,
      upload_redirect_path: upload_redirect_path,
    });
  });
};

exports.getPage = function (req, res) {
  // Find the analysis
  var memeid = req.params.id;

  //Return all results
  MEME.findOne({ _id: memeid }, function (err, meme) {
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
exports.getLog = function (req, res) {
  var id = req.params.id;

  //Return all results
  MEME.findOne({ _id: id }, function (err, meme) {
    if (err || !meme) {
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
 * app.get('/meme/:id/cancel', meme.cancel);
 */
exports.cancel = function (req, res) {
  var id = req.params.id;

  //Return all results
  MEME.findOne({ _id: id }, function (err, meme) {
    if (err || !meme) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      meme.cancel(function (err, success) {
        if (success) {
          res.json(200, { success: "yes" });
        } else {
          res.json(500, { success: "no" });
        }
      });
    }
  });
};

exports.resubscribePendingJobs = function (req, res) {
  MEME.subscribePendingJobs();
};

exports.getMSAFile = function (req, res) {
  var id = req.params.id,
    name = req.params.name;

  var options = {};

  MEME.findOne({ _id: id }, function (err, meme) {
    res.sendFile(meme.filepath, options, function (err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  });
};

exports.fasta = function (req, res) {
  var id = req.params.id;

  MEME.findOne({ _id: id }, function (err, meme) {
    if (err || !meme) {
      winston.info(err);
      res.json(500, error.errorReponse("invalid id : " + id));
    }
    Msa.deliverFasta(meme.filepath)
      .then((value) => {
        res.json(200, { fasta: value });
      })
      .catch((err) => {
        winston.info(err);
        res.json(500, { error: "Unable to deliver fasta." });
      });
  });
};

exports.getUsage = function (req, res) {
  client.get(MEME.cachePath(), function (err, data) {
    try {
      res.json(200, JSON.parse(data));
    } catch (err) {
      winston.info(err);
    }
  });
};
