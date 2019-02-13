var mongoose = require("mongoose"),
  extend = require("mongoose-schema-extend"),
  path = require("path"),
  Msa = require(__dirname + "/msa");

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
  posterior_estimation_method: Number
});

Fade.virtual("pmid").get(function() {
  return "22807683";
});

Fade.virtual("analysistype").get(function() {
  return "fade";
});

Fade.virtual("upload_redirect_path").get(function() {
  return "/fade/" + this._id;
});

/**
 * Complete file path for document's file upload
 */
Fade.virtual("filepath").get(function() {
  return path.resolve(__dirname + "/../../uploads/msa/" + this._id + ".fasta");
});

/**
 * Filename of document's file upload
 */
Fade.virtual("status_stack").get(function() {
  return ["queue", "running", "completed"];
});

/**
 * URL for a busted path
 */
Fade.virtual("url").get(function() {
  return "http://" + setup.host + "/fade/" + this._id;
});

module.exports = mongoose.model("Fade", Fade);
