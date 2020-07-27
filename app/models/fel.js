var mongoose = require("mongoose"),
  path = require("path"),
  logger = require("../../lib/logger"),
  helpers = require("../../lib/helpers");

var AnalysisSchema = require(__dirname + "/analysis");

var FEL = AnalysisSchema.extend({
  tagged_nwk_tree: String,
  analysis_type: Number,
  original_extension: String,
  last_status_msg: String,
  results: Object,
  ds_variation: Number,
});

FEL.virtual("pmid").get(function () {
  return "22807683";
});

FEL.virtual("analysistype").get(function () {
  return "fel";
});

FEL.virtual("upload_redirect_path").get(function () {
  return path.join("/fel/", String(this._id), "/select-foreground");
});

/**
 * Complete file path for document's file upload
 */
FEL.virtual("filepath").get(function () {
  return path.join(__dirname, "/../../uploads/msa/", this._id + ".fasta");
});

/**
 * Original file path for document's file upload
 */
FEL.virtual("original_fn").get(function () {
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
FEL.virtual("status_stack").get(function () {
  return ["queue", "running", "completed"];
});

/**
 * URL for a busted path
 */
FEL.virtual("url").get(function () {
  return "http://" + setup.host + "/fel/" + this._id;
});

/**
 * API request job spawn
 */
FEL.statics.spawn = function (fn, options, callback) {
  const Msa = mongoose.model("Msa");

  var fel = new this(),
    datatype = 0,
    gencodeid = options.gencodeid,
    ds_variation = options.ds_variation;

  fel.original_extension = options.original_extension;
  fel.tagged_nwk_tree = options.nwk_tree;
  fel.analysis_type = options.analysis_type;
  fel.mail = options.mail;

  Msa.parseFile(fn, datatype, gencodeid, (err, msa) => {
    if (err) {
      res.json(500, { error: err });
      return;
    }

    // Check if msa exceeds limitations
    if (msa.sites > fel.max_sites) {
      var error =
        "Site limit exceeded! Sites must be less than " + fel.max_sites;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    if (msa.sequences > fel.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        fel.max_sequences;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    fel.msa = msa;
    fel.status = fel.status_stack[0];
    fel.ds_variation = ds_variation;

    fel.save((err, fel_result) => {
      if (err) {
        logger.error("fel save failed");
        callback(err, null);
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error("fel rename failed");
          callback(err, null);
        } else {
          var move = Msa.removeTreeFromFile(
            fel_result.filepath,
            fel_result.filepath
          );
          move.then(
            (val) => {
              var connect_callback = function (data) {
                if (data == "connected") {
                  logger.log("connected");
                }
              };
              callback(null, fel);
              this.submitJob(fel_result, connect_callback);
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
        fs.writeFile(fel_result.original_fn, data, (err) => {
          if (err) {
            logger.error("write file failed");
            callback(err, null);
          }
          helpers.moveSafely(fn, fel_result.filepath, move_cb.bind(this));
        });
      });
    });
  });
};

module.exports = mongoose.model("FEL", FEL);
