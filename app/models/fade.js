var mongoose = require("mongoose"),
  path = require("path"),
  logger = require("../../lib/logger"),
  helpers = require(__dirname + "/../../lib/helpers.js");

var AnalysisSchema = require(__dirname + "/analysis");

var Fade = AnalysisSchema.extend({
  analysis_type: Number,
  last_status_msg: String,
  results: Object,
  number_of_grid_points: Number,
  number_of_mcmc_chains: Number,
  length_of_each_chain: Number,
  number_of_burn_in_samples: Number,
  number_of_samples: Number,
  concentration_of_dirichlet_prior: Number,
  substitution_model: Number,
  posterior_estimation_method: Number,
});

Fade.virtual("pmid").get(function () {
  return "22807683";
});

Fade.virtual("analysistype").get(function () {
  return "fade";
});

Fade.virtual("upload_redirect_path").get(function () {
  return "/fade/" + this._id;
});

/**
 * Complete file path for document's file upload
 */
Fade.virtual("filepath").get(function () {
  return path.resolve(__dirname + "/../../uploads/msa/" + this._id + ".fasta");
});

/**
 * Filename of document's file upload
 */
Fade.virtual("status_stack").get(function () {
  return ["queue", "running", "completed"];
});

/**
 * URL for a busted path
 */
Fade.virtual("url").get(function () {
  return "http://" + setup.host + "/fade/" + this._id;
});

Fade.statics.spawn = function (fn, options, callback) {
  const Msa = mongoose.model("Msa");

  var fade = new this();
  fade.mail = options.mail;

  let gencodeid = 1, //1 hardcoded .invoke
    datatype = 2; //2 hardcoded .invoke

  const connect_callback = function (data) {
    if (data == "connected") {
      logger.log("connected");
    }
  };

  Msa.parseFile(fn, datatype, gencodeid, (err, msa) => {
    if (err) {
      logger.error(err);
      callback(err);
      return;
    }
    // Check if msa exceeds limitations
    if (msa.sites > fade.max_sites) {
      const error =
        "Site limit exceeded! Sites must be less than " + fade.max_sites;
      logger.error(error);
      callback(error);
      return;
    }

    if (msa.sequences > fade.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        fade.max_sequences;
      logger.error(error);
      callback(error);
      return;
    }

    fade.msa = msa;
    fade.status = fade.status_stack[0];

    fade.number_of_grid_points = options.number_of_grid_points;
    fade.number_of_mcmc_chains = options.number_of_mcmc_chains;
    fade.length_of_each_chain = options.length_of_each_chain;
    fade.number_of_burn_in_samples = options.number_of_burn_in_samples;
    fade.number_of_samples = options.number_of_samples;
    fade.concentration_of_dirichlet_prior =
      options.concentration_of_dirichlet_prior;
    fade.substitution_model = options.substitution_model;
    fade.posterior_estimation_method = options.posterior_estimation_method;

    fade.save((err, fade_result) => {
      if (err) {
        logger.error("fade save failed");
        callback(err);
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error(
            "fade rename failed" +
              " Errored on line within models/fade.js :: move_cb " +
              err
          );
          callback(err, null);
        } else {
          var to_send = fade;
          to_send.upload_redirect_path = fade.upload_redirect_path;
          this.submitJob(fade_result, connect_callback);
          callback(null, fade);
        }
      }
      helpers.moveSafely(fn, fade_result.filepath, move_cb.bind(this));
    });
  });
};

module.exports = mongoose.model("Fade", Fade);
