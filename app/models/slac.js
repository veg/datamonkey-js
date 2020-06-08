var mongoose = require("mongoose"),
  extend = require("mongoose-schema-extend"),
  path = require("path"),
  Msa = require(__dirname + "/msa");

var AnalysisSchema = require(__dirname + "/analysis");

var SLAC = AnalysisSchema.extend({
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

/*
() fileName should be full proper file name :: /temp/filename.nex
() params will depend on model related params
() callback is triggered after .save triggers move callback
*/
//SLAC.spawn = function(fileName, params, callback) { //Worked but had null for req.body
//SLAC.virtual("spawn").get(function(fileName, params, callback) { //Does not work, req.body null
//function spawn(fileName, req, callback){
//SLAC.statics.spawn = function(fileName, params, callback) { //did not work (no function found)
//SLAC.statics.spawn(function(fileName, req, callback){ //Error SLAC.statics.spawn not a function
SLAC.statics.spawn = function (fn, datatype, gencodeid, callback) {
  //Worked but had null for req.body
  var connect_callback = function (data) {
    if (data == "connected") {
      logger.log("connected");
    }
  };

  Msa.parseFile(fn, datatype, gencodeid, function (err, msa) {
    /* 

    Currently parseFile will say it isn't a function 
    OR statics.spawn will say it isn't a function.


    NONE OF THE BELOW CODE HAS RAN TO EVEN ATTEMPT ANY CHANGES
    this.xyz most likely won't work, but I am crossing that bridge when I get there.

    */

    var today2 = new Date();
    console.log("Attempting to run ParseFile " + today2.getMilliseconds());
    if (err) {
      res.json(500, { error: err + today2.getMilliseconds() });
      callback(err);
      return;
    }
    // Check if msa exceeds limitations
    if (msa.sites > this.max_sites) {
      var error =
        "Site limit exceeded! Sites must be less than " + this.max_sites;
      logger.error(error);
      callback(error);
      return;
    }
    if (msa.sequences > this.max_sequences) {
      var error =
        "Sequence limit exceeded! Sequences must be less than " +
        this.max_sequences;
      logger.error(error);
      callback(error);
      return;
    }

    this.msa = msa;
    this.status = this.status_stack[0];

    this.save(function (err, slac_result) {
      if (err) {
        logger.error("slac save failed");
        callback(err);
        return;
      }
      function move_cb(err, result) {
        if (err) {
          logger.error(
            "slac rename failed" +
              " Errored on line 282~ within slac.js :: move_cb " +
              err
          );
          callback(err);
        } else {
          var to_send = this;
          to_send.upload_redirect_path = this.upload_redirect_path;
          SLAC.submitJob(slac_result, connect_callback);
          callback(result);
        }
      }
      helpers.moveSafely(fn, slac_result.filepath, move_cb);
    });
  });
};

module.exports = mongoose.model("SLAC", SLAC);
