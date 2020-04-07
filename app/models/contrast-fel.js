var mongoose = require("mongoose"),
  extend = require("mongoose-schema-extend"),
  path = require("path"),
  Msa = require(__dirname + "/msa");

var AnalysisSchema = require(__dirname + "/analysis");

var ContrastFEL = AnalysisSchema.extend({
  tagged_nwk_tree: String,
  analysis_type: Number,
  original_extension: String,
  last_status_msg: String,
  branch_sets: [String],
  results: Object,
  ds_variation: Number
});

ContrastFEL.virtual("pmid").get(function() {
  return "22807683";
});

ContrastFEL.virtual("analysistype").get(function() {
  return "cfel";
});

ContrastFEL.virtual("upload_redirect_path").get(function() {
  return path.join("/contrast_fel/", String(this._id), "/select-foreground");
});

/**
 * Complete file path for document's file upload
 */
ContrastFEL.virtual("filepath").get(function() {
  return path.join(__dirname, "/../../uploads/msa/", this._id + ".fasta");
});

/**
 * Original file path for document's file upload
 */
ContrastFEL.virtual("original_fn").get(function() {
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
ContrastFEL.virtual("status_stack").get(function() {
  return ["queue", "running", "completed"];
});

/**
 * URL for a busted path
 */
ContrastFEL.virtual("url").get(function() {
  return "http://" + setup.host + "/contrast_fel/" + this._id;
});

module.exports = mongoose.model("ContrastFEL", ContrastFEL);
