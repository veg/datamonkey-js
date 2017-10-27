var mongoose = require("mongoose"),
  extend = require("mongoose-schema-extend"),
  path = require("path"),
  Msa = require(__dirname + "/msa");

var AnalysisSchema = require(__dirname + "/analysis");

var FEL = AnalysisSchema.extend({
  tagged_nwk_tree: String,
  analysis_type: Number,
  last_status_msg: String,
  results: Object,
  ds_variation          : Number
});

FEL.virtual("pmid").get(function() {
  return "22807683";
});

FEL.virtual("analysistype").get(function() {
  return "fel";
});

FEL.virtual("upload_redirect_path").get(function() {
  return path.join("/fel/", String(this._id), "/select-foreground");
});

/**
 * Complete file path for document's file upload
 */
FEL.virtual("filepath").get(function() {
  return path.join(__dirname, "/../../uploads/msa/", this._id + ".fasta");
});

/**
 * Filename of document's file upload
 */
FEL.virtual("status_stack").get(function() {
  return ["queue", "running", "completed"];
});

/**
 * URL for a busted path
 */
FEL.virtual("url").get(function() {
  return "http://" + setup.host + "/fel/" + this._id;
});

module.exports = mongoose.model("FEL", FEL);
