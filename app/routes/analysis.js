var globals = require("../../config/globals.js"),
  error = require(__dirname + "./../../lib/error.js"),
  moment = require("moment"),
  _ = require("underscore"),
  winston = require("winston"),
  fs  = require('fs'),
  extend = require("mongoose-schema-extend");

  var mongoose = require("mongoose"),
    Msa = mongoose.model("Msa"),
    Sequences = mongoose.model("Sequences"),
    PartitionInfo = mongoose.model("PartitionInfo"),
    FEL = mongoose.model("FEL"),
    aBSREL = mongoose.model("aBSREL"),
    Busted = mongoose.model("Busted"),
    FUBAR = mongoose.model("FUBAR"),
    GARD = mongoose.model("GARD"),
    MEME = mongoose.model("MEME"),
    Relax = mongoose.model("Relax"),
    HivTrace = mongoose.model("HivTrace"),
    Fade = mongoose.model("Fade"),
    SLAC = mongoose.model("SLAC");


  exports.getResults = function(model_up, req, res) {
    model_up.findOne({ _id: req.params.id }, function(err, model_var) {
      if (err || !model_var) {
        res.json(500, error.errorResponse("invalid id : " + req.params.id));
      } else {
        // Should return results page
        // Append PMID to results
        fs.readFile(model_var.results_path, 'utf8', (err, results) => {
          if (err) winston.warn(err);
            var model_var_results = JSON.parse(results);
            model_var_results["PMID"] = model_up.pmid;
            res.json(200, model_var_results);
          });
        };
    });
  };
