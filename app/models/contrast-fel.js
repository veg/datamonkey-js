var mongoose = require("mongoose"),
  extend = require("mongoose-schema-extend"),
  path = require("path"),
  Msa = require(__dirname + "/msa"),
  helpers = require("../../lib/helpers");

var AnalysisSchema = require(__dirname + "/analysis");

var ContrastFEL = AnalysisSchema.extend({
  tagged_nwk_tree: String,
  analysis_type: Number,
  original_extension: String,
  last_status_msg: String,
  branch_sets: [String],
  results: Object,
  ds_variation: Number,
});

ContrastFEL.virtual("pmid").get(function () {
  return "22807683";
});

ContrastFEL.virtual("analysistype").get(function () {
  return "cfel";
});

ContrastFEL.virtual("upload_redirect_path").get(function () {
  return path.join("/contrast_fel/", String(this._id), "/select-foreground");
});

/**
 * Complete file path for document's file upload
 */
ContrastFEL.virtual("filepath").get(function () {
  return path.join(__dirname, "/../../uploads/msa/", this._id + ".fasta");
});

/**
 * Original file path for document's file upload
 */
ContrastFEL.virtual("original_fn").get(function () {
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
ContrastFEL.virtual("status_stack").get(function () {
  return ["queue", "running", "completed"];
});

/**
 * URL for a busted path
 */
ContrastFEL.virtual("url").get(function () {
  return "http://" + setup.host + "/contrast_fel/" + this._id;
});

/**
 * API request job spawn
 */
ContrastFEL.statics.spawn = function (fn, options, callback) {
  const Msa = mongoose.model("Msa");

  var contrast_fel = new this(),
    datatype = 0,
    gencodeid = options.gencodeid,
    ds_variation = options.ds_variation;

  contrast_fel.original_extension = options.original_extension;
  contrast_fel.tagged_nwk_tree = options.nwk_tree;
  contrast_fel.analysis_type = options.analysis_type;
  contrast_fel.mail = options.mail;

  Msa.parseFile(fn, datatype, gencodeid, (err, msa) => {
    if (err) {
      res.json(500, { error: err });
      return;
    }

    // Check if msa exceeds limitations
    if (msa.sites > fel.max_sites) {
      var error =
        "Site limit exceeded! Sites must be less than " +
        contrast_fel.max_sites;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    if (msa.sequences > contrast_fel.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        contrast_fel.max_sequences;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    contrast_fel.msa = msa;
    contrast_fel.status = contrast_fel.status_stack[0];
    contrast_fel.ds_variation = ds_variation;

    contrast_fel.save((err, contrast_fel_result) => {
      if (err) {
        logger.error("fel save failed");
        callback(err, null);
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error("contrast_fel rename failed");
          callback(err, null);
        } else {
          var move = Msa.removeTreeFromFile(
            contrast_fel_result.filepath,
            contrast_fel_result.filepath
          );
          move.then(
            (val) => {
              var connect_callback = function (data) {
                if (data == "connected") {
                  logger.log("connected");
                }
              };
              callback(null, contrast_fel);
              this.submitJob(contrast_fel_result, connect_callback);
            },
            (reason) => {
              callback(err, "issue removing tree from file");
            }
          );
        }
      }

      fs.readFile(fn, (err, data) => {
        if (err) {
          logger.error("read file failed");
          callback(err, null);
        }
        fs.writeFile(contrast_fel_result.original_fn, data, (err) => {
          if (err) {
            logger.error("write file failed");
            callback(err, null);
          }
          helpers.moveSafely(
            fn,
            contrast_fel_result.filepath,
            move_cb.bind(this)
          );
        });
      });
    });
  });
};

module.exports = mongoose.model("ContrastFEL", ContrastFEL);
