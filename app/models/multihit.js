var mongoose = require("mongoose"),
  path = require("path"),
  logger = require("../../lib/logger"),
  helpers = require(__dirname + "/../../lib/helpers.js");

var AnalysisSchema = require(__dirname + "/analysis");

var MULTIHIT = AnalysisSchema.extend({
  last_status_msg: String,
  results: Object,
  triple_islands: String,
  rate_classes: Number,
});

MULTIHIT.virtual("analysistype").get(function () {
  return "multihit";
});

MULTIHIT.virtual("pmid").get(function () {
  return "TBD";
});

/**
 * Filename of document's file upload
 */
MULTIHIT.virtual("status_stack").get(function () {
  return ["queue", "running", "completed"];
});

MULTIHIT.virtual("upload_redirect_path").get(function () {
  return path.join("/multihit/", String(this._id));
});

/**
 * Complete file path for document's file upload
 */
MULTIHIT.virtual("filepath").get(function () {
  return path.resolve(__dirname + "/../../uploads/msa/" + this._id + ".fasta");
});

/**
 * URL for a multihit path
 */
MULTIHIT.virtual("url").get(function () {
  return "http://" + setup.host + "/multihit/" + this._id;
});

/**
 * Shared API / Web request job spawn
 */
MULTIHIT.statics.spawn = function (fn, options, callback) {
  const Msa = mongoose.model("Msa");

  var multihit = new this();

  let gencodeid = options.gencodeid,
    datatype = options.datatype;

  multihit.datatype = options.datatype;
  multihit.gencodeid = options.gencodeid;
  multihit.mail = options.mail;
  multihit.rate_classes = options.rate_classes;
  multihit.triple_islands = options.triple_islands;

  if (options.source == "api") {
    multihit.source = "API";
  }

  const connect_callback = function (data) {
    if (data == "connected") {
      logger.log("connected");
    }
  };

  Msa.parseFile(fn, datatype, gencodeid, (err, msa) => {
    if (err) {
      logger.error(err);
      callback(err);
      return;
    }
    // Check if msa exceeds limitations
    if (msa.sites > multihit.max_sites) {
      const error =
        "Site limit exceeded! Sites must be less than " + multihit.max_sites;
      logger.error(error);
      callback(error);
      return;
    }

    if (msa.sequences > multihit.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        multihit.max_sequences;
      logger.error(error);
      callback(error);
      return;
    }

    multihit.msa = msa;
    multihit.status = multihit.status_stack[0];

    multihit.save((err, multihit_result) => {
      if (err) {
        logger.error("multihit save failed");
        callback(err);
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error(
            "multihit rename failed" +
              " Errored on line 113~ within models/multihit.js :: move_cb " +
              err
          );
          callback(err, null);
        } else {
          var to_send = multihit;
          to_send.upload_redirect_path = multihit.upload_redirect_path;
          this.submitJob(multihit_result, connect_callback);
          callback(null, multihit);
        }
      }
      helpers.moveSafely(fn, multihit_result.filepath, move_cb.bind(this));
    });
  });
};
module.exports = mongoose.model("MULTIHIT", MULTIHIT);
