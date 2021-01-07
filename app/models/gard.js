var mongoose = require("mongoose"),
  path = require("path"),
  logger = require("../../lib/logger"),
  helpers = require("../../lib/helpers");

require("mongoose-schema-extend");

var AnalysisSchema = require(__dirname + "/analysis");

var GARD = AnalysisSchema.extend({
  analysis_type: Number,
  datatype: String,
  last_status_msg: String,
  results: Object,
  site_to_site_variation: String,
  rate_classes: Number,
});

GARD.virtual("pmid").get(function () {
  return "22807683";
});

GARD.virtual("analysistype").get(function () {
  return "gard";
});

GARD.virtual("upload_redirect_path").get(function () {
  return "/gard/" + this._id;
});

GARD.virtual("max_sequences").get(function () {
  return 1000;
});

/**
 * Complete file path for document's file upload
 */
GARD.virtual("filepath").get(function () {
  return path.resolve(__dirname + "/../../uploads/msa/" + this._id + ".fasta");
});

/**
 * Result NEXUS file
 */
GARD.virtual("result_nexus_fn").get(function () {
  return __dirname + "/../../uploads/msa/" + this._id + ".gard.result.nex";
});

/**
 * Filename of document's file upload
 */
GARD.virtual("status_stack").get(function () {
  return ["queue", "running", "completed"];
});

/**
 * URL for GARD path
 */
GARD.virtual("url").get(function () {
  return "http://" + setup.host + "/gard/" + this._id;
});

/**
 * Shared API / Web request job spawn
 */
GARD.statics.spawn = function (fn, options, callback) {
  const Msa = mongoose.model("Msa");

  var gard = new this();

  let gencodeid = options.gencodeid,
    site_to_site_variation = options.site_to_site_variation,
    rate_classes = options.rate_classes,
    datatype = options.datatype;

  gard.site_to_site_variation = site_to_site_variation;
  gard.rate_classes = rate_classes;
  gard.datatype = datatype;
  gard.mail = options.mail;

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
    if (msa.sites > gard.max_sites) {
      const error =
        "Site limit exceeded! Sites must be less than " + gard.max_sites;
      logger.error(error);
      callback(error);
      return;
    }

    if (msa.sequences > gard.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        gard.max_sequences;
      logger.error(error);
      callback(error);
      return;
    }

    gard.msa = msa;
    gard.status = gard.status_stack[0];

    gard.save((err, gard_result) => {
      if (err) {
        logger.error("gard save failed");
        callback(err);
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error(
            "gard rename failed" +
              " Errored on line 113~ within models/gard.js :: move_cb " +
              err
          );
          callback(err, null);
        } else {
          var to_send = gard;
          to_send.upload_redirect_path = gard.upload_redirect_path;
          this.submitJob(gard_result, connect_callback);
          callback(null, gard);
        }
      }
      helpers.moveSafely(fn, gard_result.filepath, move_cb.bind(this));
    });
  });
};

module.exports = mongoose.model("GARD", GARD);
