var mongoose = require("mongoose"),
  path = require("path"),
  _ = require("lodash"),
  logger = require("../../lib/logger"),
  helpers = require("../../lib/helpers");

var AnalysisSchema = require(__dirname + "/analysis");

var MEME = mongoose.Schema({
  analysis_type: Number,
  last_status_msg: String,
  results: Object,
  resample: Number,
  bootstrap: Boolean,
  multiple_hits: String,
  site_multihit: String,
  rates: Number,
  impute_states: String,
});

MEME.add(AnalysisSchema);

MEME.virtual("pmid").get(function () {
  return "22807683";
});

MEME.virtual("analysistype").get(function () {
  return "meme";
});

MEME.virtual("upload_redirect_path").get(function () {
  return "/meme/" + this._id;
});

/**
 * Complete file path for document's file upload
 */
MEME.virtual("filepath").get(function () {
  return path.resolve(__dirname + "/../../uploads/msa/" + this._id + ".fasta");
});

/**
 * Filename of document's file upload
 */
MEME.virtual("status_stack").get(function () {
  return ["queue", "running", "completed"];
});

/**
 * URL for a busted path
 */
MEME.virtual("url").get(function () {
  return "http://" + setup.host + "/meme/" + this._id;
});

/**
 * Shared API / Web request job spawn
 */
MEME.statics.spawn = function (fn, options, callback) {
  const Msa = mongoose.model("Msa");
  var meme = new this();

  let gencodeid = options.gencodeid,
    datatype = options.datatype;

  meme.mail = options.mail;

  // Check advanced options
  if (!_.isNaN(options.resample)) {
    meme.resample = options.resample;
    meme.bootstrap = true;
  } else {
    meme.bootstrap = false;
  }

  const connect_callback = function (data) {
    if (data == "connected") {
      logger.log("connected");
    }
  };

  Msa.parseFile(fn, datatype, gencodeid, (err, msa) => {
    if (err) {
      callback(err);
      return;
    }
    // Check if msa exceeds limitations
    if (msa.sites > meme.max_sites) {
      const error =
        "Site limit exceeded! Sites must be less than " + meme.max_sites;
      logger.error(error);
      callback(error);
      return;
    }

    if (msa.sequences > meme.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        meme.max_sequences;
      logger.error(error);
      callback(error);
      return;
    }

    meme.msa = msa;
    meme.status = meme.status_stack[0];

    meme.save((err, meme_result) => {
      if (err) {
        logger.error("meme save failed");
        callback(err);
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error(
            "meme rename failed" +
              " Errored on line 113~ within models/meme.js :: move_cb " +
              err,
          );
          callback(err, null);
        } else {
          var move = Msa.removeTreeFromFile(
            meme_result.filepath,
            meme_result.filepath,
          );
          move.then(
            (val) => {
              let to_send = meme;
              to_send.upload_redirect_path = meme.upload_redirect_path;
              this.submitJob(meme_result, connect_callback);
              callback(null, meme);
            },
            (reason) => {
              res.json(500, { error: "issue removing tree from file" });
            },
          );
        }
      }
      helpers.moveSafely(fn, meme_result.filepath, move_cb.bind(this));
    });
  });
};

module.exports = mongoose.model("MEME", MEME);
