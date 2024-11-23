var mongoose = require("mongoose"),
  Msa = require(__dirname + "/msa");

var AnalysisSchema = require(__dirname + "/analysis");

var PRIME = mongoose.Schema({
  analysis_type: Number,
  last_status_msg: String,
  results: Object,
});

PRIME.add(AnalysisSchema);

PRIME.virtual("pmid").get(function () {
  return "22807683";
});

PRIME.virtual("analysistype").get(function () {
  return "prime";
});

PRIME.virtual("upload_redirect_path").get(function () {
  return "/prime/" + this._id;
});

PRIME.virtual("max_sequences").get(function () {
  return 1000;
});

/**
 * Complete file path for document's file upload
 */
PRIME.virtual("filepath").get(function () {
  return __dirname + "/../../uploads/msa/" + this._id + ".fasta";
});

/**
 * Filename of document's file upload
 */
PRIME.virtual("status_stack").get(function () {
  return ["queue", "running", "completed"];
});

/**
 * URL for a busted path
 */
PRIME.virtual("url").get(function () {
  return "http://" + setup.host + "/prime/" + this._id;
});

module.exports = mongoose.model("PRIME", PRIME);
