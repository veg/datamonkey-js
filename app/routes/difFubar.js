var error = require(__dirname + "/../../lib/error.js"),
  logger = require("../../lib/logger"),
  setup = require(__dirname + "/../../config/setup.js"),
  path = require("path");

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
  try {
    // Debug logging for file upload
    logger.info("difFUBAR upload request received");
    logger.info("req.files:", JSON.stringify(req.files));
    logger.info("req.body:", JSON.stringify(req.body));
    
    if (!req.files || !req.files.files || !req.files.files.file) {
      const error = "No file uploaded or invalid file structure";
      logger.error(error);
      return res.status(500).json({ error: error });
    }

    var fn = req.files.files.file;
    let postdata = req.body;
    
    // Validate required parameters
    if (!postdata.gencodeid) {
      const error = "Missing genetic code parameter";
      logger.error(error);
      return res.status(500).json({ error: error });
    }
    
    let options = {
      datatype: 0,
      gencodeid: postdata.gencodeid,
      mail: postdata.mail,
      number_of_grid_points: postdata.number_of_grid_points || 20,
      concentration_of_dirichlet_prior: postdata.concentration_of_dirichlet_prior || 0.5,
      mcmc_iterations: postdata.mcmc_iterations || 2500,
      burnin_samples: postdata.burnin_samples || 500,
      pos_threshold: postdata.pos_threshold || 0.95,
    };

    logger.info("difFUBAR options:", JSON.stringify(options));

    DifFUBAR.spawn(fn, options, (err, result) => {
      if (err) {
        logger.error("difFubar spawn failed:", err);
        return res.status(500).json({ error: err.message || err });
      }
      // Redirect to tree tagging form instead of job page
      return res.status(200).json({
        analysis: result,
        upload_redirect_path: "/difFubar/" + result._id + "/select-foreground",
      });
    });
  } catch (error) {
    logger.error("difFUBAR route error:", error);
    return res.status(500).json({ error: "An unexpected error occurred: " + error.message });
  }
};

exports.selectForeground = function (req, res) {
  var difFubarid = req.params.id;

  // Find the analysis and show tree tagging form
  DifFUBAR.findOne({ _id: difFubarid }, function (err, difFubar) {
    if (err || !difFubar) {
      return res.status(500).json(error.errorResponse("Invalid ID : " + difFubarid));
    } else {
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
      return res.status(500).json(error.errorResponse("Invalid ID : " + difFubarid));
    } else {
      // Update analysis with tagged tree and branch sets
      difFubar.tagged_nwk_tree = nwk_tree;
      difFubar.branch_sets = branch_sets;
      difFubar.status = "tree_tagged";
      
      difFubar.save(function (err) {
        if (err) {
          logger.error(err);
          return res.status(500).json({ error: "Failed to save tagged tree" });
        } else {
          // Start the analysis with tagged tree
          difFubar.start(function (err, result) {
            if (err) {
              logger.error(err);
              return res.status(500).json({ error: "Failed to start analysis" });
            } else {
              return res.status(200).json({ difFubar: difFubar });
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
      return res.status(500).json(error.errorResponse("Invalid ID : " + difFubarid));
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
      return res.status(500).json(error.errorResponse("invalid id : " + id));
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
      return res.status(500).json(error.errorResponse("invalid id : " + id));
    } else {
      difFubar.cancel(function (err, success) {
        if (success) {
          return res.status(200).json({ success: "yes" });
        } else {
          return res.status(500).json({ success: "no" });
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
      return res.status(500).json(error.errorResponse("invalid id : " + id));
    }
    Msa.deliverFasta(difFubar.filepath)
      .then((value) => {
        return res.status(200).json({ fasta: value });
      })
      .catch((err) => {
        winston.info(err);
        return res.status(500).json({ error: "Unable to deliver fasta." });
      });
  });
};

exports.getUsage = function (req, res) {
  client.get(DifFUBAR.cachePath(), function (err, data) {
    try {
      return res.status(200).json(JSON.parse(data));
    } catch (err) {
      winston.info(err);
      return res.status(500).json({ error: "Unable to get usage data." });
    }
  });
};

// Serve plot files (PNG and SVG)
exports.getPlotFile = function (req, res) {
  var id = req.params.id;
  var plotType = req.params.plotType; // overview, posteriors, detections
  var format = req.params.format; // png, svg

  DifFUBAR.findOne({ _id: id }, function (err, difFubar) {
    if (err || !difFubar) {
      logger.error(err);
      res.status(404).send("Job not found");
      return;
    }

    // Construct the plot file path based on the server-side naming convention
    // Server saves files as: results_short_fn + '_' + plotType + '.' + format  
    const plotFileName = difFubar._id + ".difFubar_" + plotType + "." + format;
    const plotFilePath = path.join(__dirname, "../../uploads/msa/", plotFileName);

    // Set appropriate content type
    const contentType = format === 'svg' ? 'image/svg+xml' : 'image/png';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${plotFileName}"`);

    // Send the file
    res.sendFile(path.resolve(plotFilePath), function (err) {
      if (err) {
        logger.error("Plot file not found: " + plotFilePath);
        res.status(404).send("Plot file not found");
      }
    });
  });
};