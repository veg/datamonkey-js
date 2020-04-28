var winston = require("winston"),
  setup = require("../config/setup");

var log_level = setup.log_level || "info";

var logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      level: "warn",
      filename: "./logs/all-logs.log",
      handleExceptions: true,
      json: true,
      maxsize: 5242880, //5MB
      maxFiles: 5,
      colorize: false
    }),
    new winston.transports.Console({
      level: log_level,
      handleExceptions: true,
      prettyPrint: true,
      json: false,
      colorize: true,
      timestamp: true
    })
  ],
  exitOnError: false
});

module.exports = logger;

module.exports.stream = {
  write: function(message, encoding) {
    logger.info(message);
  }
};
