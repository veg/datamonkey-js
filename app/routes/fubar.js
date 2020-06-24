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
  FUBAR = mongoose.model("FUBAR");

var redis = require("redis"),
  client = redis.createClient({ host: setup.redisHost, port: setup.redisPort });

exports.form = function (req, res) {
  var post_to = "/fubar";
  res.render("fubar/form.ejs", { post_to: post_to });
};

exports.invoke = function (req, res) {
  var fn = req.files.files.file;
  let postdata = req.body;
  let options = {
    datatype: 0,
    gencodeid: postdata.gencodeid,
    mail: postdata.mail,
    number_of_grid_points: postdata.number_of_grid_points,
    number_of_mcmc_chains: postdata.number_of_mcmc_chains,
    length_of_each_chain: postdata.length_of_each_chain,
    number_of_burn_in_samples: postdata.number_of_burn_in_samples,
    number_of_samples: postdata.number_of_samples,
    concentration_of_dirichlet_prior: postdata.concentration_of_dirichlet_prior,
  };

  FUBAR.spawn(fn, options, (err, result) => {
    if (err) {
      logger.error(err);
      logger.error("fubar rename failed");
      res.json(500, { error: err });
    }
    res.json(200, {
      analysis: result,
      upload_redirect_path: result.upload_redirect_path,
    });
  });
};

exports.getPage = function (req, res) {
  // Find the analysis
  var fubarid = req.params.id;

  //Return all results
  FUBAR.findOne({ _id: fubarid }, function (err, fubar) {
    if (err || !fubar) {
      res.json(500, error.errorResponse("Invalid ID : " + fubarid));
    } else {
      // Should return results page
      res.render("fubar/jobpage.ejs", { job: fubar });
    }
  });
};

/**
 * Returns log txt file
 * app.get('/fubar/:id/log.txt', fubar.getLog);
 */
exports.getLog = function (req, res) {
  var id = req.params.id;

  //Return all results
  FUBAR.findOne({ _id: id }, function (err, fubar) {
    if (err || !fubar) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      res.set({ "Content-Disposition": 'attachment; filename="log.txt"' });
      res.set({ "Content-type": "text/plain" });
      res.send(fubar.last_status_msg);
    }
  });
};

/**
 * cancels existing job
 * app.get('/fubar/:id/cancel', fubar.cancel);
 */
exports.cancel = function (req, res) {
  var id = req.params.id;

  //Return all results
  FUBAR.findOne({ _id: id }, function (err, fubar) {
    if (err || !fubar) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      fubar.cancel(function (err, success) {
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
  FUBAR.subscribePendingJobs();
};

exports.getMSAFile = function (req, res) {
  var id = req.params.id,
    name = req.params.name;

  var options = {};

  FUBAR.findOne({ _id: id }, function (err, fubar) {
    res.sendFile(fubar.filepath, options, function (err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  });
};

exports.fasta = function (req, res) {
  var id = req.params.id;

  FUBAR.findOne({ _id: id }, function (err, fubar) {
    if (err || !fubar) {
      winston.info(err);
      res.json(500, error.errorReponse("invalid id : " + id));
    }
    Msa.deliverFasta(fubar.filepath)
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
  client.get(FUBAR.cachePath(), function (err, data) {
    try {
      res.json(200, JSON.parse(data));
    } catch (err) {
      winston.info(err);
    }
  });
};
