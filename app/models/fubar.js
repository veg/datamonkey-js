var mongoose = require("mongoose"),
  extend = require("mongoose-schema-extend"),
  path = require("path"),
  Msa = require(__dirname + "/msa"),
  helpers = require("../../lib/helpers");

var AnalysisSchema = require(__dirname + "/analysis");

var FUBAR = AnalysisSchema.extend({
  analysis_type: Number,
  last_status_msg: String,
  results: Object,
  number_of_grid_points: Number,
  concentration_of_dirichlet_prior: Number,
});

FUBAR.virtual("pmid").get(function () {
  return "22807683";
});

FUBAR.virtual("analysistype").get(function () {
  return "fubar";
});

FUBAR.virtual("upload_redirect_path").get(function () {
  return "/fubar/" + this._id;
});

/**
 * Complete file path for document's file upload
 */
FUBAR.virtual("filepath").get(function () {
  return path.resolve(__dirname + "/../../uploads/msa/" + this._id + ".fasta");
});

/**
 * Filename of document's file upload
 */
FUBAR.virtual("status_stack").get(function () {
  return ["queue", "running", "completed"];
});

/**
 * URL for a busted path
 */
FUBAR.virtual("url").get(function () {
  return "http://" + setup.host + "/fubar/" + this._id;
});

FUBAR.statics.spawn = function (fn, options, callback) {
  const Msa = mongoose.model("Msa");

  var fubar = new this();
  fubar.mail = options.mail;

  let gencodeid = options.gencodeid;
  let datatype = options.datatype;

  // options
  // datatype, gencodeid, mail
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
    if (msa.sites > fubar.max_sites) {
      const error =
        "Site limit exceeded! Sites must be less than " + fubar.max_sites;
      logger.error(error);
      callback(error);
      return;
    }

    if (msa.sequences > fubar.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        fubar.max_sequences;
      logger.error(error);
      callback(error);
      return;
    }

    fubar.msa = msa;
    fubar.status = fubar.status_stack[0];
    fubar.number_of_grid_points = options.number_of_grid_points;
    fubar.number_of_mcmc_chains = options.number_of_mcmc_chains;
    fubar.length_of_each_chain = options.length_of_each_chain;
    fubar.number_of_burn_in_samples = options.number_of_burn_in_samples;
    fubar.number_of_samples = options.number_of_samples;
    fubar.concentration_of_dirichlet_prior =
      options.concentration_of_dirichlet_prior;

    fubar.save((err, fubar_result) => {
      if (err) {
        logger.error("fubar save failed");
        callback(err);
        return;
      }

      function move_cb(err, result) {
        if (err) {
          logger.error(
            "fubar rename failed" +
              " Errored on line 113~ within models/fubar.js :: move_cb " +
              err
          );
          callback(err, null);
        } else {
          var to_send = fubar;
          to_send.upload_redirect_path = fubar.upload_redirect_path;
          this.submitJob(fubar_result, connect_callback);
          callback(null, fubar);
        }
      }
      helpers.moveSafely(fn, fubar_result.filepath, move_cb.bind(this));
    });
  });
};

module.exports = mongoose.model("FUBAR", FUBAR);
