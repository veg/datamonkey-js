var error = require(__dirname + " /../../lib/error.js"),
  path = require("path"),
  logger = require("../../lib/logger"),
  setup = require(__dirname + "/../../config/setup.js");

var mongoose = require("mongoose"),
  Msa = mongoose.model("Msa"),
  GARD = mongoose.model("GARD");

var redis = require("redis"),
  client = redis.createClient({ host: setup.redisHost, port: setup.redisPort });

exports.form = function (req, res) {
  var post_to = "/gard";
  res.render("gard/form.ejs", { post_to: post_to });
};

exports.invoke = function (req, res) {
  let postdata = req.body;
  let fn = req.files.files.file;

  let options = {
    datatype: postdata.datatype,
    gencodeid: postdata.gencodeid,
    site_to_site_variation: postdata.site_to_site_variation,
    rate_classes: postdata.rate_classes,
    mail: postdata.mail,
  };

  GARD.spawn(fn, options, (err, result) => {
    if (err) {
      logger.warn("Error with spawning GARD job from browser :: " + err);
    }

    res.json(200, {
      analysis: result,
      upload_redirect_path: result.upload_redirect_path,
    });
  });
};

exports.getPage = function (req, res) {
  // Find the analysis
  var gardid = req.params.id;

  //Return all results
  GARD.findOne({ _id: gardid }, function (err, gard) {
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
exports.getLog = function (req, res) {
  const gardid = req.params.id;

  //Return all results
  GARD.findOne({ _id: gardid }, function (err, gard) {
    if (err || !gard) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + gardid));
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
exports.cancel = function (req, res) {
  var id = req.params.id;

  //Return all results
  GARD.findOne({ _id: id }, function (err, gard) {
    if (err || !busted) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      gard.cancel(function (err, success) {
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
  GARD.subscribePendingJobs();
};

exports.getMSAFile = function (req, res) {
  var id = req.params.id,
    name = req.params.name;

  var options = {};

  GARD.findOne({ _id: id }, function (err, gard) {
    res.sendFile(gard.filepath, options, function (err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  });
};

exports.fasta = function (req, res) {
  var id = req.params.id;

  GARD.findOne({ _id: id }, function (err, gard) {
    if (err || !gard) {
      winston.info(err);
      res.json(500, error.errorReponse("invalid id : " + id));
    }
    Msa.deliverFasta(gard.filepath)
      .then((value) => {
        res.json(200, { fasta: value });
      })
      .catch((err) => {
        winston.info(err);
        res.json(500, { error: "Unable to deliver fasta." });
      });
  });
};

exports.getScreenedData = function (req, res) {
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

exports.getUsage = function (req, res) {
  client.get(GARD.cachePath(), function (err, data) {
    try {
      res.json(200, JSON.parse(data));
    } catch (err) {
      winston.info(err);
    }
  });
};
