var mongoose = require("mongoose"),
  extend = require("mongoose-schema-extend"),
  path = require("path"),
  Msa = require(__dirname + "/msa");

var AnalysisSchema = require(__dirname + "/analysis");

var BGM = AnalysisSchema.extend({
  analysis_type: Number,
  datatype: Number,
  last_status_msg: String,
  length_of_each_chain: Number,
  number_of_burn_in_samples: Number,
  number_of_samples: Number,
  maximum_parents_per_node: Number,
  minimum_subs_per_site: Number,
  results: Object
});

BGM.virtual("pmid").get(function() {
  return "18562270";
});

BGM.virtual("analysistype").get(function() {
  return "bgm";
});

BGM.virtual("upload_redirect_path").get(function() {
  return "/bgm/" + this._id;
});

/**
 * Complete file path for document's file upload
 */
BGM.virtual("filepath").get(function() {
  return path.resolve(__dirname + "/../../uploads/msa/" + this._id + ".fasta");
});

/**
 * Filename of document's file upload
 */
BGM.virtual("status_stack").get(function() {
  return ["queue", "running", "completed"];
});

/**
 * URL for a busted path
 */
BGM.virtual("url").get(function() {
  return "http://" + setup.host + "/bgm/" + this._id;
});

module.exports = mongoose.model("BGM", BGM);
