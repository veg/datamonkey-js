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
  MULTIHIT = mongoose.model("MULTIHIT"),
  CFEL = mongoose.model("ContrastFEL"),
  Relax = mongoose.model("Relax"),
  Fade = mongoose.model("Fade"),
  SLAC = mongoose.model("SLAC");

function usageStatisticsLooper() {
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
    //HivTrace,
    SLAC,
    MULTIHIT,
    CFEL,
  ];

  for (i in method_array) {
    method_array[i].usageStatistics((err, data) => {});
  }
}

setInterval(usageStatisticsLooper, 3600000);
//setInterval(usageStatisticsLooper, 360);

module.exports = usageStatisticsLooper;
