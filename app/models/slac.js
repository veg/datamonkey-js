const mongoose = require("mongoose"),
  extend = require("mongoose-schema-extend"),
  path = require("path"),
  helpers = require("../../lib/helpers");

const AnalysisSchema = require(__dirname + "/analysis");

const SLAC = AnalysisSchema.extend({
  analysis_type: Number,
  last_status_msg: String,
  results: Object,
});

SLAC.virtual("pmid").get(function () {
  return "22807683";
});

SLAC.virtual("analysistype").get(function () {
  return "slac";
});

SLAC.virtual("upload_redirect_path").get(function () {
  return "/slac/" + this._id;
});

/**
 * Complete file path for document's file upload
 */
SLAC.virtual("filepath").get(function () {
  return path.resolve(__dirname + "/../../uploads/msa/" + this._id + ".fasta");
});

/**
 * Filename of document's file upload
 */
SLAC.virtual("status_stack").get(function () {
  return ["queue", "running", "completed"];
});

/**
 * URL for a busted path
 */
SLAC.virtual("url").get(function () {
  return "http://" + setup.host + "/slac/" + this._id;
});

/**
 * Shared API / Web request job spawn
 */
SLAC.statics.spawn = function (fn, options, callback) {
  const Msa = mongoose.model("Msa");
  var slac = new this();

  let gencodeid = options.gencodeid,
    datatype = options.datatype;

  slac.mail = options.mail;

  const connect_callback = function (data) {
    if (data == "connected") {
      logger.log("connected");
    }
  };

  Msa.parseFile(fn, datatype, gencodeid, (err, msa) => {
    if (err) {
      res.json(500, { error: err });
      callback(err);
      return;
    }
    // Check if msa exceeds limitations
    if (msa.sites > slac.max_sites) {
      const error =
        "Site limit exceeded! Sites must be less than " + slac.max_sites;
      logger.error(error);
      callback(error);
      return;
    }

    if (msa.sequences > slac.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        slac.max_sequences;
      logger.error(error);
      callback(error);
      return;
    }

    slac.msa = msa;
    slac.status = slac.status_stack[0];

    slac.save((err, slac_result) => {
      if (err) {
        logger.error("slac save failed");
        callback(err);
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error(
            "slac rename failed" +
              " Errored on line 113~ within models/slac.js :: move_cb " +
              err
          );
          callback(err, null);
        } else {
          var to_send = slac;
          to_send.upload_redirect_path = slac.upload_redirect_path;
          this.submitJob(slac_result, connect_callback);
          callback(null, slac);
        }
      }
      helpers.moveSafely(fn, slac_result.filepath, move_cb.bind(this));
    });
  });
};

module.exports = mongoose.model("SLAC", SLAC);
