var logger = require("./logger");
var _ = require("underscore");

module.exports.errorResponse = function(message) {
  return { error: message };
};

/*
  Factory for error loggers.

  If ignoreCodes is given, errors with codes in that array are
  ignored.

  if logCodes is given, only errors with codes in that array are
  logged.
 */
module.exports.errorLogger = function(ignoreCodes, logCodes) {
  return function(e) {
    if (!e) {
      return;
    }
    if (ignoreCodes) {
      if (_.contains(ignoreCodes, e.code)) {
        return;
      }
    }
    if (logCodes) {
      if (!_.contains(logCodes, e.code)) {
        return;
      }
    }
    logger.error(e);
  };
};
