var mongoose = require("mongoose"),
  extend = require("mongoose-schema-extend"),
  path = require("path"),
  logger = require("../../lib/logger"),
  helpers = require(__dirname + "/../../lib/helpers.js"),
  Msa = require(__dirname + "/msa");

var AnalysisSchema = require(__dirname + "/analysis");

var BGM = AnalysisSchema.extend({
  analysis_type: Number,
  substitution_model: Number,
  last_status_msg: String,
  length_of_each_chain: Number,
  number_of_burn_in_samples: Number,
  number_of_samples: Number,
  maximum_parents_per_node: Number,
  minimum_subs_per_site: Number,
  results: Object,
});

BGM.virtual("pmid").get(function () {
  return "18562270";
});

BGM.virtual("analysistype").get(function () {
  return "bgm";
});

BGM.virtual("upload_redirect_path").get(function () {
  return "/bgm/" + this._id;
});

/**
 * Complete file path for document's file upload
 */
BGM.virtual("filepath").get(function () {
  return path.resolve(__dirname + "/../../uploads/msa/" + this._id + ".fasta");
});

/**
 * Filename of document's file upload
 */
BGM.virtual("status_stack").get(function () {
  return ["queue", "running", "completed"];
});

/**
 * URL for a busted path
 */
BGM.virtual("url").get(function () {
  return "http://" + setup.host + "/bgm/" + this._id;
});

/**
 * API request job spawn
 */
BGM.statics.spawn = function (fn, options, callback) {
  const Msa = mongoose.model("Msa");
  var bgm = new this();

  let gencodeid = options.gencodeid,
    datatype = options.datatype;

  bgm.mail = options.mail;

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
    if (msa.sites > bgm.max_sites) {
      const error =
        "Site limit exceeded! Sites must be less than " + bgm.max_sites;
      logger.error(error);
      callback(error);
      return;
    }

    if (msa.sequences > bgm.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        bgm.max_sequences;
      logger.error(error);
      callback(error);
      return;
    }

    bgm.msa = msa;
    bgm.status = bgm.status_stack[0];
    bgm.length_of_each_chain = options.length_of_each_chain;
    bgm.substitution_model = options.substitution_model;
    bgm.number_of_burn_in_samples = options.number_of_burn_in_samples;
    bgm.number_of_samples = options.number_of_samples;
    bgm.maximum_parents_per_node = options.maximum_parents_per_node;
    bgm.minimum_subs_per_site = options.minimum_subs_per_site;

    bgm.save((err, bgm_result) => {
      if (err) {
        logger.error("bgm save failed");
        callback(err);
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error(
            "bgm rename failed" +
              " Errored on line 113~ within models/bgm.js :: move_cb " +
              err
          );
          callback(err, null);
        } else {
          var to_send = bgm;
          to_send.upload_redirect_path = bgm.upload_redirect_path;
          this.submitJob(bgm_result, connect_callback);
          callback(null, bgm);
        }
      }
      helpers.moveSafely(fn, bgm_result.filepath, move_cb.bind(this));
    });
  });
};

module.exports = mongoose.model("BGM", BGM);
