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
// in flight. A start time rather than a boolean, so a run whose callback never
// fires only blocks later runs for a few hours instead of forever.
var usageStatisticsStartedAt = null;
var USAGE_STATISTICS_STALE_MS = 3 * 3600000;

function usageStatisticsLooper() {
  if (
    usageStatisticsStartedAt &&
    Date.now() - usageStatisticsStartedAt < USAGE_STATISTICS_STALE_MS
  ) {
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

  usageStatisticsStartedAt = Date.now();

  // Run one method at a time so that only a single year's worth of job
  // statistics is held in memory at once, rather than all methods
  // concurrently.
  var next = function (i) {
    if (i >= method_array.length) {
      usageStatisticsStartedAt = null;
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
