var mongoose = require("mongoose"),
  extend = require("mongoose-schema-extend"),
  fs = require("fs"),
  path = require("path"),
  tar = require("tar-fs"),
  _ = require("underscore"),
  hpcsocket = require(path.join(__dirname, "/../../lib/hpcsocket.js")),
  winston = require("winston"),
  Msa = require(__dirname + "/msa");

var AnalysisSchema = require(__dirname + "/analysis");

var Flea = AnalysisSchema.extend({
  msas: [Msa.MsaSchema],
  last_status_msg: String,
  mail: String,
  results: Object
});

Flea.virtual("analysistype").get(function() {
  return "flea";
});

/**
 * Filename of document's file upload
 */
Flea.virtual("status_stack").get(function() {
  return ["transferring", "preparing_data", "queued", "running", "completed"];
});

/**
 * Complete file path for document's file upload
 */
Flea.virtual("filepath").get(function() {
  return __dirname + "/../../uploads/flea/" + this._id + ".tar";
});

/**
 * Complete file path for document's file upload
 */
Flea.methods.filesize = function(cb) {
  var bytes = 0;
  fs.stat(
    path.join(__dirname, "/../../uploads/flea/", this._id + ".tar"),
    function(err, data) {
      if (data) {
        bytes = data.size;
      }
      cb(err, bytes);
    }
  );
};

/**
 * Complete file path for document's file upload
 */
Flea.virtual("filedir").get(function() {
  return __dirname + "/../../uploads/flea/" + this._id + "/";
});

/**
 */
Flea.virtual("session_json_fn").get(function() {
  return __dirname + "/../../uploads/flea/" + this._id + "/session.json";
});

/**
 */
Flea.virtual("session_zip_fn").get(function() {
  return __dirname + "/../../uploads/flea/" + this._id + "/session.zip";
});

/**
 */
Flea.virtual("predefined_regions").get(function() {
  return __dirname + "/../../public/assets/flea/predefined_regions.json";
});

Flea.virtual("pdb_structure").get(function() {
  return __dirname + "/../../public/assets/flea/pdbs/env_structure.pdb";
});

/**
 * URL for a envmonkey path
 */
Flea.virtual("url").get(function() {
  return "http://" + setup.host + "/flea/" + this._id;
});

Flea.statics.pack = function(flea) {
  return tar.pack(flea.filedir).pipe(fs.createWriteStream(flea.filepath));
};

Flea.statics.submitJob = function(result, cb) {
  winston.info(
    "submitting " + result.analysistype + " : " + result._id + " to cluster"
  );

  this.pack(result);

  var jobproxy = new hpcsocket.HPCSocket(
    {
      filepath: result.filepath,
      msas: result.msas,
      analysis: result,
      status_stack: result.status_stack,
      type: result.analysistype
    },
    "spawn",
    cb
  );
};

module.exports = mongoose.model("Flea", Flea);
