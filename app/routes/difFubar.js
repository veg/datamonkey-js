var error = require(__dirname + "/../../lib/error.js"),
  logger = require("../../lib/logger"),
  setup = require(__dirname + "/../../config/setup.js");

var mongoose = require("mongoose"),
  Msa = mongoose.model("Msa"),
  DifFUBAR = mongoose.model("DifFUBAR");

var redis = require("redis"),
  client = redis.createClient({ host: setup.redisHost, port: setup.redisPort });

exports.form = function (req, res) {
  var post_to = "/difFubar";
  res.render("difFubar/form.ejs", { post_to: post_to });
};

exports.invoke = function (req, res) {
  var fn = req.files.files.file;
  let postdata = req.body;
  let options = {
    datatype: 0,
    gencodeid: postdata.gencodeid,
    mail: postdata.mail,
    number_of_grid_points: postdata.number_of_grid_points,
    concentration_of_dirichlet_prior: postdata.concentration_of_dirichlet_prior,
    mcmc_iterations: postdata.mcmc_iterations,
    burnin_samples: postdata.burnin_samples,
    pos_threshold: postdata.pos_threshold,
  };

  DifFUBAR.spawn(fn, options, (err, result) => {
    if (err) {
      logger.error(err);
      logger.error("difFubar spawn failed");
      res.json(500, { error: err });
    }
    // Redirect to tree tagging form instead of job page
    res.json(200, {
      analysis: result,
      upload_redirect_path: "/difFubar/" + result._id + "/select-foreground",
    });
  });
};

exports.selectForeground = function (req, res) {
  var difFubarid = req.params.id;

  // Find the analysis and show tree tagging form
  DifFUBAR.findOne({ _id: difFubarid }, function (err, difFubar) {
    if (err || !difFubar) {
      res.json(500, error.errorResponse("Invalid ID : " + difFubarid));
    } else {
      // Show tree tagging form
      res.render("difFubar/tree_form.ejs", { difFubar: difFubar });
    }
  });
};

exports.annotateForeground = function (req, res) {
  var difFubarid = req.params.id;
  var nwk_tree = req.body.nwk_tree;
  var branch_sets = JSON.parse(req.body.branch_sets);

  // Find the analysis and update with tagged tree
  DifFUBAR.findOne({ _id: difFubarid }, function (err, difFubar) {
    if (err || !difFubar) {
      res.json(500, error.errorResponse("Invalid ID : " + difFubarid));
    } else {
      // Update analysis with tagged tree and branch sets
      difFubar.tagged_nwk_tree = nwk_tree;
      difFubar.branch_sets = branch_sets;
      difFubar.status = "tree_tagged";
      
      difFubar.save(function (err) {
        if (err) {
          logger.error(err);
          res.json(500, { error: "Failed to save tagged tree" });
        } else {
          // Start the analysis with tagged tree
          difFubar.start(function (err, result) {
            if (err) {
              logger.error(err);
              res.json(500, { error: "Failed to start analysis" });
            } else {
              res.json(200, { difFubar: difFubar });
            }
          });
        }
      });
    }
  });
};

exports.getPage = function (req, res) {
  // Find the analysis
  var difFubarid = req.params.id;

  //Return all results
  DifFUBAR.findOne({ _id: difFubarid }, function (err, difFubar) {
    if (err || !difFubar) {
      res.json(500, error.errorResponse("Invalid ID : " + difFubarid));
    } else {
      // Should return results page
      res.render("difFubar/jobpage.ejs", { job: difFubar });
    }
  });
};

/**
 * Returns log txt file
 * app.get('/difFubar/:id/log.txt', difFubar.getLog);
 */
exports.getLog = function (req, res) {
  var id = req.params.id;

  //Return all results
  DifFUBAR.findOne({ _id: id }, function (err, difFubar) {
    if (err || !difFubar) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      res.set({ "Content-Disposition": 'attachment; filename="log.txt"' });
      res.set({ "Content-type": "text/plain" });
      res.send(difFubar.last_status_msg);
    }
  });
};

/**
 * cancels existing job
 * app.get('/difFubar/:id/cancel', difFubar.cancel);
 */
exports.cancel = function (req, res) {
  var id = req.params.id;

  //Return all results
  DifFUBAR.findOne({ _id: id }, function (err, difFubar) {
    if (err || !difFubar) {
      winston.info(err);
      res.json(500, error.errorResponse("invalid id : " + id));
    } else {
      difFubar.cancel(function (err, success) {
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
  DifFUBAR.subscribePendingJobs();
};

exports.getMSAFile = function (req, res) {
  var id = req.params.id,
    name = req.params.name;

  var options = {};

  DifFUBAR.findOne({ _id: id }, function (err, difFubar) {
    res.sendFile(difFubar.filepath, options, function (err) {
      if (err) {
        res.status(err.status).end();
      }
    });
  });
};

exports.fasta = function (req, res) {
  var id = req.params.id;

  DifFUBAR.findOne({ _id: id }, function (err, difFubar) {
    if (err || !difFubar) {
      winston.info(err);
      res.json(500, error.errorReponse("invalid id : " + id));
    }
    Msa.deliverFasta(difFubar.filepath)
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
  client.get(DifFUBAR.cachePath(), function (err, data) {
    try {
      res.json(200, JSON.parse(data));
    } catch (err) {
      winston.info(err);
    }
  });
};