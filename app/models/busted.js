var mongoose = require("mongoose"),
  path = require("path"),
  logger = require("../../lib/logger"),
  helpers = require(__dirname + "/../../lib/helpers.js");

require("mongoose-schema-extend");

var AnalysisSchema = require(__dirname + "/analysis");

var Busted = AnalysisSchema.extend({
  tagged_nwk_tree: String,
  last_status_msg: String,
  results: Object,
  ds_variation: Number,
});

Busted.virtual("analysistype").get(function () {
  return "busted";
});

Busted.virtual("pmid").get(function () {
  return "25701167";
});

Busted.virtual("max_sequences").get(function () {
  return 1000;
});

/**
 * Filename of document's file upload
 */
Busted.virtual("status_stack").get(function () {
  return ["queue", "running", "completed"];
});

Busted.virtual("upload_redirect_path").get(function () {
  return path.join("/busted/", String(this._id), "/select-foreground");
});

/**
 * Complete file path for document's file upload
 */
Busted.virtual("filepath").get(function () {
  return path.resolve(__dirname + "/../../uploads/msa/" + this._id + ".fasta");
});

/**
 * URL for a busted path
 */
Busted.virtual("url").get(function () {
  return "http://" + setup.host + "/busted/" + this._id;
});

/**
 * API request job spawn
 */
Busted.statics.spawn = function (fn, options, callback) {
  const Msa = mongoose.model("Msa");

  var busted = new this(),
    datatype = 0,
    gencodeid = options.gencodeid,
    ds_variation = options.ds_variation;

  busted.tagged_nwk_tree = options.nwk_tree;
  busted.mail = options.mail;

  Msa.parseFile(fn, datatype, gencodeid, (err, msa) => {
    if (err) {
      res.json(500, { error: err });
      return;
    }

    // Check if msa exceeds limitations
    if (msa.sites > busted.max_sites) {
      var error =
        "Site limit exceeded! Sites must be less than " + busted.max_sites;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    if (msa.sequences > busted.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        busted.max_sequences;
      logger.error(error);
      res.json(500, { error: error });
      return;
    }

    busted.msa = msa;
    busted.ds_variation = ds_variation;

    busted.save((err, busted_result) => {
      if (err) {
        logger.error("busted save failed");
        callback(err, null);
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error("busted rename failed");
          callback(err, null);
        } else {
          var move = Msa.removeTreeFromFile(
            busted_result.filepath,
            busted_result.filepath
          );
          move.then(
            (val) => {
              var connect_callback = function (data) {
                if (data == "connected") {
                  logger.log("connected");
                }
              };
              callback(null, busted);
              this.submitJob(busted_result, connect_callback);
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
        fs.writeFile(busted_result.original_fn, data, (err) => {
          if (err) {
            logger.error("write file failed");
            callback(err, null);
          }
          helpers.moveSafely(fn, busted_result.filepath, move_cb.bind(this));
        });
      });
    });
  });
};

module.exports = mongoose.model("Busted", Busted);
