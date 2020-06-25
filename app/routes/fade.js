var error = require(__dirname + " /../../lib/error.js"),
  helpers = require(__dirname + "/../../lib/helpers.js"),
  logger = require("../../lib/logger"),
  setup = require(__dirname + "/../../config/setup.js");

var mongoose = require("mongoose"),
  Msa = mongoose.model("Msa"),
  FADE = mongoose.model("Fade");

var redis = require("redis"),
  client = redis.createClient({ host: setup.redisHost, port: setup.redisPort });

exports.form = function (req, res) {
  var post_to = "/fade";
  res.render("fade/form.ejs", { post_to: post_to });
};

exports.invoke = function (req, res) {
  var connect_callback = function (data) {
    if (data == "connected") {
      logger.log("connected");
    }
  };

  var fn = req.files.files.file,
    fade = new FADE(),
    postdata = req.body,
    datatype = 2,
    gencodeid = 1;

  fade.mail = postdata.mail;

  Msa.parseFile(fn, datatype, gencodeid, function (err, msa) {
    if (err) {
      res.json(500, { error: err });
      return;
    }

    // Check if msa exceeds limitations
    if (msa.sites > fade.max_sites) {
      var error =
        "Site limit exceeded! Sites must be less than " + fade.max_sites;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    if (msa.sequences > fade.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        fade.max_sequences;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    fade.msa = msa;

    fade.status = fade.status_stack[0];
    fade.number_of_grid_points = postdata.number_of_grid_points;
    fade.number_of_mcmc_chains = postdata.number_of_mcmc_chains;
    fade.length_of_each_chain = postdata.length_of_each_chain;
    fade.number_of_burn_in_samples = postdata.number_of_burn_in_samples;
    fade.number_of_samples = postdata.number_of_samples;
    fade.concentration_of_dirichlet_prior =
      postdata.concentration_of_dirichlet_prior;
    fade.substitution_model = postdata.substitution_model;
    fade.posterior_estimation_method = postdata.posterior_estimation_method;

    fade.save(function (err, fade_result) {
      if (err) {
        logger.error("fade save failed");
        logger.error(err);
        res.json(500, { error: err });
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error(err);
          logger.error("fade rename failed");
          res.json(500, { error: err });
        } else {
          var to_send = fade;
          to_send.upload_redirect_path = fade.upload_redirect_path;
          res.json(200, {
            analysis: fade,
            upload_redirect_path: fade.upload_redirect_path,
          });

          // Send the MSA and analysis type
          FADE.submitJob(fade_result, connect_callback);
        }
      }

      helpers.moveSafely(req.files.files.file, fade_result.filepath, move_cb);
    });
  });
};

exports.getPage = function (req, res) {
  // Find the analysis
  var fadeid = req.params.id;

  //Return all results
  FADE.findOne({ _id: fadeid }, function (err, fade) {
    if (err || !fade) {
      res.json(500, error.errorResponse("Invalid ID : " + fadeid));
    } else {
      // Should return results page
      res.render("fade/jobpage.ejs", { job: fade });
    }
  });
};

/**
 * Returns log txt file
 * app.get('/fade/:id/log.txt', fade.getLog);
 */
exports.getLog = function (req, res) {
  var id = req.params.id;

  //Return all results
  FADE.findOne({ _id: id }, function (err, fade) {
    if (err || !fade) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      res.set({ "Content-Disposition": 'attachment; filename="log.txt"' });
      res.set({ "Content-type": "text/plain" });
      res.send(fade.last_status_msg);
    }
  });
};

/**
 * cancels existing job
 * app.get('/fade/:id/cancel', fade.cancel);
 */
exports.cancel = function (req, res) {
  var id = req.params.id;

  //Return all results
  FADE.findOne({ _id: id }, function (err, fade) {
    if (err || !fade) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      fade.cancel(function (err, success) {
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
  FADE.subscribePendingJobs();
};

exports.getMSAFile = function (req, res) {
  var id = req.params.id,
    name = req.params.name;

  var options = {};

  FADE.findOne({ _id: id }, function (err, fade) {
    res.sendFile(fade.filepath, options, function (err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  });
};

exports.fasta = function (req, res) {
  var id = req.params.id;

  FADE.findOne({ _id: id }, function (err, fade) {
    if (err || !fade) {
      winston.info(err);
      res.json(500, error.errorReponse("invalid id : " + id));
    }
    Msa.deliverFasta(fade.filepath)
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
  client.get(FADE.cachePath(), function (err, data) {
    try {
      res.json(200, JSON.parse(data));
    } catch (err) {
      winston.info(err);
    }
  });
};
