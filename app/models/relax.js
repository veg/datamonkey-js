var mongoose = require("mongoose"),
  extend = require("mongoose-schema-extend"),
  path = require("path"),
  logger = require("../../lib/logger"),
  helpers = require(__dirname + "/../../lib/helpers.js"),
  Msa = require(__dirname + "/msa");

var AnalysisSchema = require(__dirname + "/analysis");

var Relax = AnalysisSchema.extend({
  tagged_nwk_tree: String,
  analysis_type: Number,
  original_extension: String,
  last_status_msg: String,
  results: Object,
});

Relax.virtual("analysistype").get(function () {
  return "relax";
});

Relax.virtual("pmid").get(function () {
  return "25540451";
});

/**
 * Filename of document's file upload
 */
Relax.virtual("status_stack").get(function () {
  return ["queue", "running", "completed"];
});

/**
 * Complete file path for document's file upload
 */
Relax.virtual("filepath").get(function () {
  return path.resolve(__dirname + "/../../uploads/msa/" + this._id + ".fasta");
});

/**
 * Original file path for document's file upload
 */
Relax.virtual("original_fn").get(function () {
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
Relax.virtual("url").get(function () {
  return "http://" + setup.host + "/relax/" + this._id;
});

Relax.statics.spawn = function (fn, options, callback) {
  const Msa = mongoose.model("Msa");

  var relax = new this(),
    datatype = 0,
    gencodeid = options.gencodeid;

  relax.mail = options.mail;
  relax.tagged_nwk_tree = options.nwk_tree;
  relax.analysis_type = options.analysis_type;
  relax.original_extension = options.fileExtension;

  Msa.parseFile(fn, datatype, gencodeid, (err, msa) => {
    if (err) {
      res.json(500, { error: err });
      return;
    }

    // Check if msa exceeds limitations
    if (msa.sites > relax.max_sites) {
      var error =
        "Site limit exceeded! Sites must be less than " + relax.max_sites;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    if (msa.sequences > relax.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        relax.max_sequences;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    relax.msa = msa;
    relax.status = relax.status_stack[0];

    relax.save((err, relax_result) => {
      if (err) {
        logger.error("relax save failed");
        callback(err, null);
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error("relax rename failed");
          callback(err, null);
        } else {
          var move = Msa.removeTreeFromFile(
            relax_result.filepath,
            relax_result.filepath
          );
          move.then(
            (val) => {
              var connect_callback = function (data) {
                if (data == "connected") {
                  logger.log("connected");
                }
              };
              callback(null, relax);
              this.submitJob(relax_result, connect_callback);
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
        fs.writeFile(relax_result.original_fn, data, (err) => {
          if (err) {
            logger.error("write file failed");
            callback(err, null);
          }
          helpers.moveSafely(fn, relax_result.filepath, move_cb.bind(this));
        });
      });
    });
  });
};

module.exports = mongoose.model("Relax", Relax);
