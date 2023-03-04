var mongoose = require("mongoose"),
  path = require("path"),
  logger = require("../../lib/logger"),
  helpers = require(__dirname + "/../../lib/helpers.js");

require("mongoose-schema-extend");

var AnalysisSchema = require(__dirname + "/analysis");

var NRM = AnalysisSchema.extend({
  last_status_msg: String,
  results: Object,
});

NRM.virtual("analysistype").get(function () {
  return "nrm";
});

NRM.virtual("pmid").get(function () {
  return "TBD";
});

NRM.virtual("max_sequences").get(function () {
  return 1000;
});

/**
 * Filename of document's file upload
 */
NRM.virtual("status_stack").get(function () {
  return ["queue", "running", "completed"];
});

NRM.virtual("upload_redirect_path").get(function () {
  return path.join("/nrm/", String(this._id));
});

/**
 * Complete file path for document's file upload
 */
NRM.virtual("filepath").get(function () {
  return path.resolve(__dirname + "/../../uploads/msa/" + this._id + ".fasta");
});

/**
 * URL for a nrm path
 */
NRM.virtual("url").get(function () {
  return "http://" + setup.host + "/nrm/" + this._id;
});

/**
 * Shared API / Web request job spawn
 */
NRM.statics.spawn = function (fn, options, callback) {
  const Msa = mongoose.model("Msa");

  var nrm = new this();

  let gencodeid = options.gencodeid,
    datatype = options.datatype;

  nrm.datatype = options.datatype;
  nrm.gencodeid = options.gencodeid;
  nrm.mail = options.mail;
  nrm.rate_classes = options.rate_classes;
  nrm.triple_islands = options.triple_islands;

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
    if (msa.sites > nrm.max_sites) {
      const error =
        "Site limit exceeded! Sites must be less than " + nrm.max_sites;
      logger.error(error);
      callback(error);
      return;
    }

    if (msa.sequences > nrm.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        nrm.max_sequences;
      logger.error(error);
      callback(error);
      return;
    }

    nrm.msa = msa;
    nrm.status = nrm.status_stack[0];

    nrm.save((err, nrm_result) => {
      if (err) {
        logger.error("nrm save failed");
        callback(err);
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error(
            "nrm rename failed" +
              " Errored on line 113~ within models/nrm.js :: move_cb " +
              err
          );
          callback(err, null);
        } else {
          var to_send = nrm;
          to_send.upload_redirect_path = nrm.upload_redirect_path;
          this.submitJob(nrm_result, connect_callback);
          callback(null, nrm);
        }
      }
      helpers.moveSafely(fn, nrm_result.filepath, move_cb.bind(this));
    });
  });
};
module.exports = mongoose.model("NRM", NRM);
