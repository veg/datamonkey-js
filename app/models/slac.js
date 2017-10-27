var mongoose = require("mongoose"),
  extend = require("mongoose-schema-extend"),
  Msa = require(__dirname + "/msa");

var AnalysisSchema = require(__dirname + "/analysis");

var SLAC = AnalysisSchema.extend({
  analysis_type         : Number,
  last_status_msg       : String,
  results               : Object
});

SLAC.virtual("pmid").get(function() {
  return "22807683";
});

SLAC.virtual("analysistype").get(function() {
  return "slac";
});

SLAC.virtual("upload_redirect_path").get(function() {
  return "/slac/" + this._id;
});

/**
 * Complete file path for document's file upload
 */
SLAC.virtual("filepath").get(function() {
  return __dirname + "/../../uploads/msa/" + this._id + ".fasta";
});

/**
 * Filename of document's file upload
 */
SLAC.virtual("status_stack").get(function() {
  return ["queue", "running", "completed"];
});

/**
 * URL for a busted path
 */
SLAC.virtual("url").get(function() {
  return "http://" + setup.host + "/slac/" + this._id;
});

module.exports = mongoose.model("SLAC", SLAC);
