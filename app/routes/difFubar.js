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
    
    // Grid points default: 20
    // This matches the original datamonkey-js implementation default
    // TODO: Verify against original Julia CodonMolecularEvolution.jl package
    // As of 2024, the original Julia implementation could not be verified
    const DIFFUBAR_GRID_POINTS_DEFAULT = 20;
    
    let options = {
      datatype: 0,
      gencodeid: postdata.gencodeid,
      mail: postdata.mail,
      number_of_grid_points: parseInt(postdata.number_of_grid_points) || DIFFUBAR_GRID_POINTS_DEFAULT,
      concentration_of_dirichlet_prior: parseFloat(postdata.concentration_of_dirichlet_prior) || 0.5,
      mcmc_iterations: parseInt(postdata.mcmc_iterations) || 2500,
      burnin_samples: parseInt(postdata.burnin_samples) || 500,
      pos_threshold: parseFloat(postdata.pos_threshold) || 0.95,
    };

    logger.info("difFUBAR options:", JSON.stringify(options));

    logger.info("Calling DifFUBAR.spawn()...");
    DifFUBAR.spawn(fn, options, (err, result) => {
      logger.info("=== DifFUBAR.spawn callback called ===");
      if (err) {
        logger.error("difFubar spawn failed:", err);
        return res.status(500).json({ error: err.message || err });
      }
      logger.info("DifFUBAR.spawn succeeded:");
      logger.info("- Result ID:", result._id);
      logger.info("- Result status:", result.status);
      
      // Redirect to tree tagging form instead of job page
      logger.info("Sending response with redirect path");
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
  logger.info("=== START selectForeground ===");
  var difFubarid = req.params.id;
  logger.info("selectForeground for ID:", difFubarid);

  // Find the analysis and show tree tagging form
  DifFUBAR.findOne({ _id: difFubarid }, function (err, difFubar) {
    if (err || !difFubar) {
      logger.error("Failed to find DifFUBAR for selectForeground:", err);
      return res.status(500).json(error.errorResponse("Invalid ID : " + difFubarid));
    } else {
      logger.info("Found DifFUBAR for selectForeground:");
      logger.info("- ID:", difFubar._id);
      logger.info("- Status:", difFubar.status);
      logger.info("- Created:", difFubar.created);
      logger.info("Rendering tree_form.ejs");
      res.render("difFubar/tree_form.ejs", { difFubar: difFubar });
    }
  });
};

exports.annotateForeground = function (req, res) {
  logger.info("=== START annotateForeground ===");
  var difFubarid = req.params.id;
  var nwk_tree = req.body.nwk_tree;
  var branch_sets = JSON.parse(req.body.branch_sets);

  logger.info("difFubarid:", difFubarid);
  logger.info("nwk_tree length:", nwk_tree ? nwk_tree.length : "null");
  logger.info("branch_sets:", JSON.stringify(branch_sets));

  // Find the analysis and update with tagged tree
  logger.info("Finding DifFUBAR analysis...");
  DifFUBAR.findOne({ _id: difFubarid }, function (err, difFubar) {
    if (err || !difFubar) {
      logger.error("Failed to find DifFUBAR analysis:", err);
      return res.status(500).json(error.errorResponse("Invalid ID : " + difFubarid));
    } else {
      logger.info("Found DifFUBAR analysis, current status:", difFubar.status);
      
      // Update analysis with tagged tree and branch sets
      difFubar.tagged_nwk_tree = nwk_tree;
      difFubar.branch_sets = branch_sets;
      difFubar.status = "tree_tagged";
      
      logger.info("Updated analysis fields, saving...");
      difFubar.save(function (err) {
        if (err) {
          logger.error("Failed to save tagged tree:", err);
          return res.status(500).json({ error: "Failed to save tagged tree" });
        } else {
          logger.info("Successfully saved tagged tree, calling start()...");
          
          // Start the analysis with tagged tree
          difFubar.start(function (err, result) {
            logger.info("=== START CALLBACK CALLED ===");
            if (err) {
              logger.error("difFubar.start() failed:", err);
              return res.status(500).json({ error: "Failed to start analysis" });
            } else {
              logger.info("difFubar.start() succeeded, result:", result ? "exists" : "null");
              logger.info("Final difFubar status:", difFubar.status);
              logger.info("=== SENDING RESPONSE ===");
              return res.status(200).json({ difFubar: difFubar });
            }
          });
          
          logger.info("Called difFubar.start(), waiting for callback...");
        }
      });
    }
  });
  logger.info("=== END annotateForeground setup ===");
};

exports.getPage = function (req, res) {
  logger.info("=== START getPage ===");
  // Find the analysis
  var difFubarid = req.params.id;
  logger.info("Getting page for difFubarid:", difFubarid);

  //Return all results
  DifFUBAR.findOne({ _id: difFubarid }, function (err, difFubar) {
    if (err || !difFubar) {
      logger.error("Failed to find DifFUBAR for getPage:", err);
      return res.status(500).json(error.errorResponse("Invalid ID : " + difFubarid));
    } else {
      logger.info("Found DifFUBAR for getPage:");
      logger.info("- ID:", difFubar._id);
      logger.info("- Status:", difFubar.status);
      logger.info("- Created:", difFubar.created);
      logger.info("- Last status msg:", difFubar.last_status_msg ? difFubar.last_status_msg.substring(0, 100) + "..." : "null");
      logger.info("- Tagged tree exists:", !!difFubar.tagged_nwk_tree);
      logger.info("- Branch sets exists:", !!difFubar.branch_sets);
      
      // Should return results page
      logger.info("Rendering jobpage.ejs");
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

    // Get the appropriate file path from the model's virtual properties
    let plotFilePath;
    if (plotType === 'overview' && format === 'png') {
      plotFilePath = difFubar.overview_plot_png_fn;
    } else if (plotType === 'overview' && format === 'svg') {
      plotFilePath = difFubar.overview_plot_svg_fn;
    } else if (plotType === 'posteriors' && format === 'png') {
      plotFilePath = difFubar.posterior_plots_png_fn;
    } else if (plotType === 'posteriors' && format === 'svg') {
      plotFilePath = difFubar.posterior_plots_svg_fn;
    } else if (plotType === 'detections' && format === 'png') {
      plotFilePath = difFubar.detection_plots_png_fn;
    } else if (plotType === 'detections' && format === 'svg') {
      plotFilePath = difFubar.detection_plots_svg_fn;
    } else {
      return res.status(404).send("Invalid plot type or format");
    }

    if (!plotFilePath) {
      return res.status(404).send("Plot file path not available");
    }

    // Set appropriate content type
    const contentType = format === 'svg' ? 'image/svg+xml' : 'image/png';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${id}-${plotType}.${format}"`);

    // Send the file
    res.sendFile(path.resolve(plotFilePath), function (err) {
      if (err) {
        logger.error("Plot file not found: " + plotFilePath);
        res.status(404).send("Plot file not found");
      }
    });
  });
};