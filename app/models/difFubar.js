var mongoose = require("mongoose"),
  path = require("path"),
  helpers = require("../../lib/helpers");

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
  const Msa = mongoose.model("Msa");
  var difFubar = new this();

  let gencodeid = options.gencodeid,
    datatype = options.datatype;

  difFubar.mail = options.mail;

  const connect_callback = function (data) {
    if (data == "connected") {
      logger.log("connected");
    }
  };

  Msa.parseFile(fn, datatype, gencodeid, (err, msa) => {
    if (err) {
      callback(err);
      return;
    }
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

    difFubar.msa = msa;
    difFubar.status = difFubar.status_stack[0];
    difFubar.number_of_grid_points = options.number_of_grid_points;
    difFubar.concentration_of_dirichlet_prior =
      options.concentration_of_dirichlet_prior;
    difFubar.mcmc_iterations = options.mcmc_iterations;
    difFubar.burnin_samples = options.burnin_samples;
    difFubar.pos_threshold = options.pos_threshold;

    difFubar.save((err, difFubar_result) => {
      if (err) {
        logger.error("difFubar save failed");
        callback(err);
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error(
            "difFubar rename failed" +
              " Errored on line within models/difFubar.js :: move_cb " +
              err
          );
          callback(err, null);
        } else {
          var to_send = difFubar;
          to_send.upload_redirect_path = difFubar.upload_redirect_path;
          this.submitJob(difFubar_result, connect_callback);
          callback(null, difFubar);
        }
      }
      helpers.moveSafely(fn, difFubar_result.filepath, move_cb.bind(this));
    });
  });
};

module.exports = mongoose.model("DifFUBAR", DifFUBAR);