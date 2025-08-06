var mongoose = require("mongoose"),
  path = require("path"),
  helpers = require("../../lib/helpers"),
  logger = require("../../lib/logger"),
  setup = require("../../config/setup");

var AnalysisSchema = require(__dirname + "/analysis");

var DifFUBAR = mongoose.Schema({
  tagged_nwk_tree: String,
  analysis_type: Number,
  original_extension: String,
  last_status_msg: String,
  branch_sets: [String],
  results: Object,
  number_of_grid_points: Number,
  concentration_of_dirichlet_prior: Number,
  mcmc_iterations: Number,
  burnin_samples: Number,
  pos_threshold: Number,
});

DifFUBAR.add(AnalysisSchema);

DifFUBAR.virtual("pmid").get(function () {
  return "PENDING"; // Will be updated with actual PMID when paper is published
});

DifFUBAR.virtual("analysistype").get(function () {
  return "difFubar";
});

DifFUBAR.virtual("upload_redirect_path").get(function () {
  return path.join("/difFubar/", String(this._id), "/select-foreground");
});

DifFUBAR.virtual("max_sequences").get(function () {
  return 2000;
});

/**
 * Complete file path for document's file upload
 */
DifFUBAR.virtual("filepath").get(function () {
  return path.join(__dirname, "/../../uploads/msa/", this._id + ".fasta");
});

/**
 * Original file path for document's file upload
 */
DifFUBAR.virtual("original_fn").get(function () {
  return path.resolve(
    __dirname +
      "/../../uploads/msa/" +
      this._id +
      "-original." +
      this.original_extension
  );
});

/**
 * Filename of document's file upload
 */
DifFUBAR.virtual("status_stack").get(function () {
  return ["queue", "running", "completed"];
});

/**
 * URL for a difFUBAR path
 */
DifFUBAR.virtual("url").get(function () {
  return "http://" + setup.host + "/difFubar/" + this._id;
});

/**
 * Shared API / Web request job spawn
 */
DifFUBAR.statics.spawn = function (fn, options, callback) {
  logger.info("=== START DifFUBAR.spawn ===");
  logger.info("File name:", fn ? fn.name || fn : "null");
  logger.info("Options:", JSON.stringify(options));
  
  const Msa = mongoose.model("Msa");
  var difFubar = new this();

  let gencodeid = options.gencodeid,
    datatype = options.datatype;

  difFubar.mail = options.mail;
  logger.info("Created new DifFUBAR instance, mail:", difFubar.mail);

  const connect_callback = function (data) {
    if (data == "connected") {
      logger.log("connected");
    }
  };

  logger.info("Calling Msa.parseFile...");
  Msa.parseFile(fn, datatype, gencodeid, (err, msa) => {
    logger.info("=== Msa.parseFile callback called ===");
    if (err) {
      logger.error("Msa.parseFile failed:", err);
      callback(err);
      return;
    }
    
    logger.info("MSA parsed successfully:");
    logger.info("- Sites:", msa.sites);
    logger.info("- Sequences:", msa.sequences);
    logger.info("- Max sites allowed:", difFubar.max_sites);
    logger.info("- Max sequences allowed:", difFubar.max_sequences);
    
    // Check if msa exceeds limitations
    if (msa.sites > difFubar.max_sites) {
      const error =
        "Site limit exceeded! Sites must be less than " + difFubar.max_sites;
      logger.error(error);
      callback(error);
      return;
    }

    if (msa.sequences > difFubar.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        difFubar.max_sequences;
      logger.error(error);
      callback(error);
      return;
    }

    logger.info("Setting difFubar properties...");
    difFubar.msa = msa;
    difFubar.status = difFubar.status_stack[0];
    difFubar.number_of_grid_points = options.number_of_grid_points;
    difFubar.concentration_of_dirichlet_prior = options.concentration_of_dirichlet_prior;
    difFubar.mcmc_iterations = options.mcmc_iterations;
    difFubar.burnin_samples = options.burnin_samples;
    difFubar.pos_threshold = options.pos_threshold;
    
    logger.info("difFubar status set to:", difFubar.status);
    logger.info("Saving difFubar to database...");

    difFubar.save((err, difFubar_result) => {
      logger.info("=== difFubar.save callback called ===");
      if (err) {
        logger.error("difFubar save failed:", err);
        callback(err);
        return;
      }
      
      logger.info("difFubar saved successfully:");
      logger.info("- ID:", difFubar_result._id);
      logger.info("- Status:", difFubar_result.status);
      logger.info("- Filepath:", difFubar_result.filepath);

      function move_cb(err, result) {
        logger.info("=== move_cb callback called ===");
        if (err) {
          logger.error(
            "difFubar rename failed" +
              " Errored on line within models/difFubar.js :: move_cb " +
              err
          );
          callback(err, null);
        } else {
          logger.info("File moved successfully, preparing response");
          var to_send = difFubar;
          to_send.upload_redirect_path = difFubar.upload_redirect_path;
          logger.info("Upload redirect path:", to_send.upload_redirect_path);
          // Don't submit job here - wait for tree tagging first
          logger.info("=== CALLING SPAWN CALLBACK ===");
          callback(null, difFubar);
        }
      }
      
      logger.info("Moving file from", fn, "to", difFubar_result.filepath);
      helpers.moveSafely(fn, difFubar_result.filepath, move_cb.bind(this));
    });
  });
};

/**
 * Start the analysis job after tree tagging is complete
 */
DifFUBAR.methods.start = function (callback) {
  logger.info("=== START DifFUBAR.start method ===");
  var self = this;
  
  logger.info("Starting analysis for DifFUBAR:");
  logger.info("- ID:", self._id);
  logger.info("- Current status:", self.status);
  logger.info("- Tagged tree exists:", !!self.tagged_nwk_tree);
  logger.info("- Branch sets exists:", !!self.branch_sets);
  logger.info("- Branch sets length:", self.branch_sets ? self.branch_sets.length : 0);
  
  // Submit the job to the cluster
  var mongoose = require("mongoose");
  var DifFUBAR = mongoose.model("DifFUBAR");
  
  // Update status to running and save
  self.status = "running";
  logger.info("Setting status to running, saving...");
  self.save();
  
  const connect_callback = function (data) {
    if (data == "connected") {
      logger.log("connected");
    }
  };
  
  logger.info("=== CALLING START CALLBACK IMMEDIATELY ===");
  // Follow the same pattern as other models - call callback immediately
  callback(null, self);
  
  logger.info("Calling DifFUBAR.submitJob (fire-and-forget)...");
  // Then submit job without waiting for callback (fire-and-forget like other models)
  DifFUBAR.submitJob(self, connect_callback);
};

module.exports = mongoose.model("DifFUBAR", DifFUBAR);
