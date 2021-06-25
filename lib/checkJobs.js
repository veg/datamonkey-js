var setup = require("./../config/setup");

var redis = require("redis"),
  querystring = require("querystring"),
  fs = require("fs"),
  path = require("path"),
  winston = require("winston");

var mongoose = require("mongoose");

var FEL = mongoose.model("FEL"),
  aBSREL = mongoose.model("aBSREL"),
  Busted = mongoose.model("Busted"),
  BGM = mongoose.model("BGM"),
  FUBAR = mongoose.model("FUBAR"),
  GARD = mongoose.model("GARD"),
  MEME = mongoose.model("MEME"),
  Relax = mongoose.model("Relax"),
  HivTrace = mongoose.model("HivTrace"),
  Fade = mongoose.model("Fade"),
  SLAC = mongoose.model("SLAC");

function checkJobsLooper() {
  var method_array = [
    FEL,
    aBSREL,
    Busted,
    Fade,
    BGM,
    FUBAR,
    GARD,
    MEME,
    Relax,
    SLAC,
  ];

  for (i in method_array) {
    method_array[i].checkPendingJobs((err, data) => {});
  }
}

module.exports = checkJobsLooper;
