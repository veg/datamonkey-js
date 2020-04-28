var mongoose = require("mongoose"),
  extend = require("mongoose-schema-extend"),
  winston = require("winston"),
  path = require("path"),
  Msa = require(__dirname + "/msa");

var AnalysisSchema = require(__dirname + "/analysis");

var MULTIHIT = AnalysisSchema.extend({
  last_status_msg: String,
  results: Object,
  triple_islands: String,
  rate_classes: Number
});

MULTIHIT.virtual("analysistype").get(function() {
  return "multihit";
});

MULTIHIT.virtual("pmid").get(function() {
  return "TBD";
});

/**
 * Filename of document's file upload
 */
MULTIHIT.virtual("status_stack").get(function() {
  return ["queue", "running", "completed"];
});

MULTIHIT.virtual("upload_redirect_path").get(function() {
  return path.join("/multihit/", String(this._id));
});

/**
 * Complete file path for document's file upload
 */
MULTIHIT.virtual("filepath").get(function() {
  return path.resolve(__dirname + "/../../uploads/msa/" + this._id + ".fasta");
});

/**
 * URL for a multihit path
 */
MULTIHIT.virtual("url").get(function() {
  return "http://" + setup.host + "/multihit/" + this._id;
});

module.exports = mongoose.model("MULTIHIT", MULTIHIT);
