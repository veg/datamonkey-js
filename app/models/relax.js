var mongoose = require("mongoose"),
  extend = require("mongoose-schema-extend"),
  path = require("path"),
  Msa = require(__dirname + "/msa");

var AnalysisSchema = require(__dirname + "/analysis");

var Relax = AnalysisSchema.extend({
  tagged_nwk_tree: String,
  analysis_type: Number,
  original_extension: String,
  last_status_msg: String,
  results: Object
});

Relax.virtual("analysistype").get(function() {
  return "relax";
});

Relax.virtual("pmid").get(function() {
  return "25540451";
});

/**
 * Filename of document's file upload
 */
Relax.virtual("status_stack").get(function() {
  return ["queue", "running", "completed"];
});

/**
 * Complete file path for document's file upload
 */
Relax.virtual("filepath").get(function() {
  return path.resolve(__dirname + "/../../uploads/msa/" + this._id + ".fasta");
});

/**
 * Original file path for document's file upload
 */
Relax.virtual("original_fn").get(function() {
  return path.resolve(
    __dirname +
      "/../../uploads/msa/" +
      this._id +
      "-original." +
      this.original_extension
  );
});

/**
 * URL for a relax path
 */
Relax.virtual("url").get(function() {
  return "http://" + setup.host + "/relax/" + this._id;
});

module.exports = mongoose.model("Relax", Relax);
