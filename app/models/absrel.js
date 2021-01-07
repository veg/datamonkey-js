var mongoose = require("mongoose"),
  path = require("path"),
  logger = require("../../lib/logger"),
  helpers = require(__dirname + "/../../lib/helpers.js");

require("mongoose-schema-extend");

var AnalysisSchema = require(__dirname + "/analysis");

var aBSREL = AnalysisSchema.extend({
  tagged_nwk_tree: String,
  analysis_type: Number,
  last_status_msg: String,
  results: Object,
});

aBSREL.virtual("max_sequences").get(function () {
  return 75;
});

aBSREL.virtual("pmid").get(function () {
  return "25540451";
});

aBSREL.virtual("analysistype").get(function () {
  return "absrel";
});

aBSREL.virtual("upload_redirect_path").get(function () {
  return path.join("/absrel/", String(this._id), "/select-foreground");
});

aBSREL.virtual("max_sequences").get(function () {
  return 1000;
});

/**
 * Complete file path for document's file upload
 */
aBSREL.virtual("filepath").get(function () {
  return path.resolve(__dirname + "/../../uploads/msa/" + this._id + ".fasta");
});

/**
 * Original file path for document's file upload
 */
aBSREL.virtual("original_fn").get(function () {
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
aBSREL.virtual("status_stack").get(function () {
  return ["queue", "running", "completed"];
});

/**
 * URL for a busted path
 */
aBSREL.virtual("url").get(function () {
  return "http://" + setup.host + "/absrel/" + this._id;
});

/**
 * API request job spawn
 */
aBSREL.statics.spawn = function (fn, options, callback) {
  const Msa = mongoose.model("Msa");

  var absrel = new this(),
    datatype = 0,
    gencodeid = options.gencodeid;

  absrel.tagged_nwk_tree = options.nwk_tree;
  absrel.mail = options.mail;

  Msa.parseFile(fn, datatype, gencodeid, (err, msa) => {
    if (err) {
      res.json(500, { error: err });
      return;
    }

    // Check if msa exceeds limitations
    if (msa.sites > absrel.max_sites) {
      var error =
        "Site limit exceeded! Sites must be less than " + absrel.max_sites;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    if (msa.sequences > absrel.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        absrel.max_sequences;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    absrel.msa = msa;
    absrel.status = absrel.status_stack[0];

    absrel.save((err, absrel_result) => {
      if (err) {
        logger.error("absrel save failed");
        callback(err, null);
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error("absrel rename failed");
          callback(err, null);
        } else {
          var move = Msa.removeTreeFromFile(
            absrel_result.filepath,
            absrel_result.filepath
          );
          move.then(
            (val) => {
              var connect_callback = function (data) {
                if (data == "connected") {
                  logger.log("connected");
                }
              };
              callback(null, absrel);
              this.submitJob(absrel_result, connect_callback);
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
        fs.writeFile(absrel_result.original_fn, data, (err) => {
          if (err) {
            logger.error("write file failed");
            callback(err, null);
          }
          helpers.moveSafely(fn, absrel_result.filepath, move_cb.bind(this));
        });
      });
    });
  });
};

module.exports = mongoose.model("aBSREL", aBSREL);
