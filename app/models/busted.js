var mongoose = require("mongoose"),
  extend = require("mongoose-schema-extend"),
  winston = require("winston"),
  Msa = require(__dirname + "/msa");

var AnalysisSchema = require(__dirname + "/analysis");

var Busted = AnalysisSchema.extend({
  tagged_nwk_tree: String,
  last_status_msg: String,
  results: Object
});

Busted.virtual("analysistype").get(function() {
  return "busted";
});

Busted.virtual("pmid").get(function() {
  return "25701167";
});

/**
 * Filename of document's file upload
 */
Busted.virtual("status_stack").get(function() {
  return ["queue", "running", "completed"];
});

/**
 * Complete file path for document's file upload
 */
Busted.virtual("filepath").get(function() {
  return __dirname + "/../../uploads/msa/" + this._id + ".fasta";
});

/**
 * URL for a busted path
 */
Busted.virtual("url").get(function() {
  return "http://" + setup.host + "/busted/" + this._id;
});

module.exports = mongoose.model("Busted", Busted);
