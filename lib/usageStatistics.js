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

// Guards against a new hourly run starting while the previous one is still
// in flight.
var usageStatisticsRunning = false;

function usageStatisticsLooper() {
  if (usageStatisticsRunning) {
    winston.warn("usageStatistics: previous run still in progress, skipping");
    return;
  }

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

  usageStatisticsRunning = true;

  // Run one method at a time so that only a single year's worth of job
  // statistics is held in memory at once, rather than all methods
  // concurrently.
  var next = function (i) {
    if (i >= method_array.length) {
      usageStatisticsRunning = false;
      return;
    }

    try {
      method_array[i].usageStatistics((err, data) => {
        if (err) {
          winston.warn(
            "usageStatistics: " + method_array[i].modelName + ": " + err
          );
        }
        setImmediate(next, i + 1);
      });
    } catch (e) {
      winston.warn(
        "usageStatistics: " + method_array[i].modelName + ": " + e
      );
      setImmediate(next, i + 1);
    }
  };

  next(0);
}

setInterval(usageStatisticsLooper, 3600000);
//setInterval(usageStatisticsLooper, 360);

module.exports = usageStatisticsLooper;
