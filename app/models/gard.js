var mongoose = require("mongoose"),
  extend = require("mongoose-schema-extend"),
  path = require("path"),
  Msa = require(__dirname + "/msa");

var AnalysisSchema = require(__dirname + "/analysis");

var GARD = AnalysisSchema.extend({
  analysis_type: Number,
  last_status_msg: String,
  results: Object,
  site_to_site_variation: String,
  rate_classes: Number
});

GARD.virtual("pmid").get(function() {
  return "22807683";
});

GARD.virtual("analysistype").get(function() {
  return "gard";
});

GARD.virtual("upload_redirect_path").get(function() {
  return "/gard/" + this._id;
});

/**
 * Complete file path for document's file upload
 */
GARD.virtual("filepath").get(function() {
  return path.resolve(__dirname + "/../../uploads/msa/" + this._id + ".fasta");
});

/**
 * Result NEXUS file
 */
GARD.virtual("result_nexus_fn").get(function() {
  return __dirname + "/../../uploads/msa/" + this._id + ".gard.result.nex";
});

/**
 * Filename of document's file upload
 */
GARD.virtual("status_stack").get(function() {
  return ["queue", "running", "completed"];
});

/**
 * URL for a busted path
 */
GARD.virtual("url").get(function() {
  return "http://" + setup.host + "/gard/" + this._id;
});

module.exports = mongoose.model("GARD", GARD);
