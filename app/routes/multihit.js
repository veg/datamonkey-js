var error = require(__dirname + " /../../lib/error.js"),
  logger = require("../../lib/logger"),
  setup = require(__dirname + "/../../config/setup.js");

var mongoose = require("mongoose"),
  Msa = mongoose.model("Msa"),
  MULTIHIT = mongoose.model("MULTIHIT");

var redis = require("redis"),
  client = redis.createClient({ host: setup.redisHost, port: setup.redisPort });

exports.form = function (req, res) {
  var post_to = "/multihit";
  res.render("multihit/form.ejs", { post_to: post_to });
};

exports.invoke = function (req, res) {
  let postdata = req.body;
  var fn = req.files.files.file;

  let options = {
    datatype: 0,
    gencodeid: postdata.gencodeid,
    mail: postdata.mail,
    rate_classes: postdata.rate_classes,
    triple_islands: postdata.triple_islands,
  };

  MULTIHIT.spawn(fn, options, (err, result) => {
    if (err) {
      logger.warn("Error with spawning MULTIHIT job from browser :: " + err);
    }

    res.json(200, {
      analysis: result,
      upload_redirect_path: result.upload_redirect_path,
    });
  });
};

exports.getPage = function (req, res) {
  // Find the analysis
  var multihitid = req.params.id;

  //Return all results
  MULTIHIT.findOne({ _id: multihitid }, function (err, multihit) {
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
exports.getLog = function (req, res) {
  var id = req.params.id;

  //Return all results
  MULTIHIT.findOne({ _id: id }, function (err, multihit) {
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
exports.cancel = function (req, res) {
  var id = req.params.id;

  //Return all results
  MULTIHIT.findOne({ _id: id }, function (err, multihit) {
    if (err || !multihit) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      multihit.cancel(function (err, success) {
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
  MULTIHIT.subscribePendingJobs();
};

exports.getMSAFile = function (req, res) {
  var id = req.params.id,
    name = req.params.name;

  var options = {};

  MULTIHIT.findOne({ _id: id }, function (err, multihit) {
    res.sendFile(multihit.filepath, options, function (err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  });
};

exports.fasta = function (req, res) {
  var id = req.params.id;

  MULTIHIT.findOne({ _id: id }, function (err, multihit) {
    if (err || !multihit) {
      winston.info(err);
      res.json(500, error.errorReponse("invalid id : " + id));
    }
    Msa.deliverFasta(multihit.filepath)
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
  client.get(MULTIHIT.cachePath(), function (err, data) {
    try {
      res.json(200, JSON.parse(data));
    } catch (err) {
      winston.info(err);
    }
  });
};
