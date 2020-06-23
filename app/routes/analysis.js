const { callbackify } = require("util");

var globals = require("../../config/globals.js"),
  error = require(__dirname + "./../../lib/error.js"),
  moment = require("moment"),
  _ = require("underscore"),
  winston = require("winston"),
  fs = require("fs"),
  extend = require("mongoose-schema-extend");

var mongoose = require("mongoose"),
  Msa = mongoose.model("Msa"),
  Sequences = mongoose.model("Sequences"),
  PartitionInfo = mongoose.model("PartitionInfo"),
  FEL = mongoose.model("FEL"),
  ContrastFEL = mongoose.model("ContrastFEL"),
  aBSREL = mongoose.model("aBSREL"),
  Busted = mongoose.model("Busted"),
  FUBAR = mongoose.model("FUBAR"),
  GARD = mongoose.model("GARD"),
  MEME = mongoose.model("MEME"),
  MULTIHIT = mongoose.model("MULTIHIT"),
  Relax = mongoose.model("Relax"),
  HivTrace = mongoose.model("HivTrace"),
  Fade = mongoose.model("Fade"),
  SLAC = mongoose.model("SLAC");

exports.getInfo = function (model_up, req, res) {
  var id = req.params.id;

  //Return all results
  model_up.findOne(
    { _id: id },
    { torque_id: 1, creation_time: 1, start_time: 1, status: 1 },
    function (err, info) {
      if (err || !info) {
        res.json(500, error.errorResponse("Invalid ID : " + id));
      } else {
        // Should return results page
        res.json(200, info);
      }
    }
  );
};

exports.getResults = function (model_up, req, res) {
  model_up.findOne({ _id: req.params.id }, function (err, model_var) {
    if (err || !model_var) {
      res.json(500, error.errorResponse("invalid id : " + req.params.id));
    } else {
      //var options = {};
      //res.sendFile(model_var.results_path, options, function(err) {
      //  if (err) {
      //    res.status(err.status).end();
      //  }
      //});

      // Append PMID to results
      fs.readFile(model_var.results_path, "utf8", (err, results) => {
        if (err) winston.warn(err);
        var model_var_results = JSON.parse(results);
        model_var_results["PMID"] = model_up.pmid;
        res.json(200, model_var_results);
      });
    }
  });
};

exports.getInfoApi = function (options, cb) {
  //Select which method is being requested
  switch (options.method.toUpperCase()) {
    case "FEL":
      var searchModel = mongoose.model("FEL");
      break;
    case "CONTRAST-FEL":
      var searchModel = mongoose.model("ContrastFEL");
      break;
    case "CONTRASTFEL":
      var searchModel = mongoose.model("ContrastFEL");
      break;
    case "ABSREL":
      var searchModel = mongoose.model("aBSREL");
      break;
    case "BUSTED":
      var searchModel = mongoose.model("Busted");
      break;
    case "BGM":
      var searchModel = mongoose.model("BGM");
      break;
    case "FUBAR":
      var searchModel = mongoose.model("FUBAR");
      break;
    case "GARD":
      var searchModel = mongoose.model("GARD");
      break;
    case "MEME":
      var searchModel = mongoose.model("MEME");
      break;
    case "MULTIHIT":
      var searchModel = mongoose.model("MULTIHIT");
      break;
    case "RELAX":
      var searchModel = mongoose.model("RELAX");
      break;
    case "FADE":
      var searchModel = mongoose.model("FADE");
      break;
    case "SLAC":
      var searchModel = mongoose.model("SLAC");
      break;
    default:
      var err = "Requested method does not exist";
      cb(err, null);
  }

  //Return Selected Method for status
  searchModel.findOne(
    { _id: options.id },
    { torque_id: 1, creation_time: 1, start_time: 1, status: 1 },
    function (err, info) {
      if (err || !info) {
        cb(err, null);
      } else {
        // Should return results json back to API call
        cb(null, info);
      }
    }
  );
};
