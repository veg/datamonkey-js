var querystring = require("querystring"),
  error = require(__dirname + " /../../lib/error.js"),
  globals = require(__dirname + "/../../config/globals.js"),
  mailer = require(__dirname + "/../../lib/mailer.js"),
  helpers = require(__dirname + "/../../lib/helpers.js"),
  hpcsocket = require(__dirname + "/../../lib/hpcsocket.js"),
  fs = require("fs"),
  logger = require("../../lib/logger"),
  setup = require(__dirname + "/../../config/setup.js"),
  request = require("request");

var mongoose = require("mongoose"),
  Msa = mongoose.model("Msa"),
  Sequences = mongoose.model("Sequences"),
  PartitionInfo = mongoose.model("PartitionInfo"),
  SLAC = mongoose.model("SLAC");

var redis = require("redis"),
  client = redis.createClient({ host: setup.redisHost, port: setup.redisPort });

exports.form = function (req, res) {
  var post_to = "/slac";
  res.render("slac/form.ejs", { post_to: post_to });
};

/**
 * Used to invoke jobs from the website
 * models/slac.js:SLAC.spawn is shared with API and website submission.
 * routes.js :: app.post("/slac", slac.invoke);
 */
exports.invoke = function (req, res) {
  var fn = req.files.files.file;
  let postdata = req.body;
  let options = {
    datatype: 0,
    gencodeid: postdata.gencodeid,
    mail: postdata.mail,
  };

  SLAC.spawn(fn, options, (err, result) => {
    if (err) {
      logger.warn("Error with spawning SLAC job from browser :: " + err);
    }
    res.json(200, {
      analysis: result,
      upload_redirect_path: result.upload_redirect_path,
    });
  });
};

exports.getPage = function (req, res) {
  // Find the analysis
  var slacid = req.params.id;

  //Return all results
  SLAC.findOne({ _id: slacid }, function (err, slac) {
    if (err || !slac) {
      res.json(500, error.errorResponse("Invalid ID : " + slacid));
    } else {
      // Should return results page
      res.render("slac/jobpage.ejs", { job: slac });
    }
  });
};

/**
 * Returns log txt file
 * app.get('/slac/:id/results', slac.getLog);
 */
exports.getLog = function (req, res) {
  var id = req.params.id;

  //Return all results
  SLAC.findOne({ _id: id }, function (err, slac) {
    if (err || !busted) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      res.set({ "Content-Disposition": 'attachment; filename="log.txt"' });
      res.set({ "Content-type": "text/plain" });
      res.send(slac.last_status_msg);
    }
  });
};

/**
 * cancels existing job
 * app.get('/busted/:id/cancel', slac.cancel);
 */
exports.cancel = function (req, res) {
  var id = req.params.id;

  //Return all results
  SLAC.findOne({ _id: id }, function (err, slac) {
    if (err || !busted) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      slac.cancel(function (err, success) {
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
  SLAC.subscribePendingJobs();
};

exports.getMSAFile = function (req, res) {
  var id = req.params.id,
    name = req.params.name;

  var options = {};

  SLAC.findOne({ _id: id }, function (err, slac) {
    res.sendFile(slac.filepath, options, function (err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  });
};

exports.fasta = function (req, res) {
  var id = req.params.id;

  SLAC.findOne({ _id: id }, function (err, slac) {
    if (err || !slac) {
      winston.info(err);
      res.json(500, error.errorReponse("invalid id : " + id));
    }
    Msa.deliverFasta(slac.filepath)
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
  client.get(SLAC.cachePath(), function (err, data) {
    try {
      res.json(200, JSON.parse(data));
    } catch (err) {
      winston.info(err);
    }
  });
};
