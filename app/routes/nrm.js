var error = require(__dirname + " /../../lib/error.js"),
  logger = require("../../lib/logger"),
  setup = require(__dirname + "/../../config/setup.js");

var mongoose = require("mongoose"),
  Msa = mongoose.model("Msa"),
  NRM = mongoose.model("NRM");

var redis = require("redis"),
  client = redis.createClient({ host: setup.redisHost, port: setup.redisPort });

exports.form = function (req, res) {
  var post_to = "/nrm";
  res.render("nrm/form.ejs", { post_to: post_to });
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

  NRM.spawn(fn, options, (err, result) => {
    if (err) {
      logger.warn("Error with spawning NRM job from browser :: " + err);
      res.json(200, {
        analysis: { error: err },
        error: err,
      });
      return;
    }

    res.json(200, {
      analysis: result,
      upload_redirect_path: result.upload_redirect_path,
    });
  });
};

exports.getPage = function (req, res) {
  // Find the analysis
  var nrmid = req.params.id;

  //Return all results
  NRM.findOne({ _id: nrmid }, function (err, nrm) {
    if (err || !nrm) {
      res.json(500, error.errorResponse("Invalid ID : " + nrmid));
    } else {
      // Should return results page
      res.render("nrm/jobpage.ejs", { job: nrm });
    }
  });
};

/**
 * Returns log txt file
 * app.get('/nrm/:id/results', nrm.getLog);
 */
exports.getLog = function (req, res) {
  var id = req.params.id;

  //Return all results
  NRM.findOne({ _id: id }, function (err, nrm) {
    if (err || !nrm) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      res.set({ "Content-Disposition": 'attachment; filename="log.txt"' });
      res.set({ "Content-type": "text/plain" });
      res.send(nrm.last_status_msg);
    }
  });
};

/**
 * cancels existing job
 * app.get('/nrm/:id/cancel', nrm.cancel);
 */
exports.cancel = function (req, res) {
  var id = req.params.id;

  //Return all results
  NRM.findOne({ _id: id }, function (err, nrm) {
    if (err || !nrm) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      nrm.cancel(function (err, success) {
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
  NRM.subscribePendingJobs();
};

exports.getMSAFile = function (req, res) {
  var id = req.params.id,
    name = req.params.name;

  var options = {};

  NRM.findOne({ _id: id }, function (err, nrm) {
    res.sendFile(nrm.filepath, options, function (err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  });
};

exports.fasta = function (req, res) {
  var id = req.params.id;

  NRM.findOne({ _id: id }, function (err, nrm) {
    if (err || !nrm) {
      winston.info(err);
      res.json(500, error.errorReponse("invalid id : " + id));
    }
    Msa.deliverFasta(nrm.filepath)
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
  client.get(NRM.cachePath(), function (err, data) {
    try {
      res.json(200, JSON.parse(data));
    } catch (err) {
      winston.info(err);
    }
  });
};
