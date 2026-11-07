var logger = require(__dirname + "/logger");
setup = require(__dirname + "/../config/setup");

var helpers = require(__dirname + "/helpers"),
  nodemailer = require("nodemailer"),
  fs = require("fs"),
  ejs = require("ejs");

var FROM = "datamonkey <no-reply@datamonkey.org>";

var createTransport = function() {
  // nodemailer >= 2 ships a sendmail transport; no separate package needed.
  return nodemailer.createTransport({
    sendmail: true,
    path: setup.sendmail_path || "sendmail"
  });
};

// Send a message with the given nodemailer options. Never throws: failures
// (including synchronous ones) are logged and passed to the callback.
var sendMail = function(mailOptions, callback) {
  var done = function(error, info) {
    if (error) {
      logger.error(error);
    }
    if (callback) {
      callback(error, info);
    }
  };

  try {
    var transport = createTransport();
    mailOptions.from = mailOptions.from || FROM;
    transport.sendMail(mailOptions, function(error, info) {
      transport.close();
      done(error, info);
    });
  } catch (e) {
    done(e);
  }
};

var sendTemplate = function(template, subjectPrefix, job) {
  var path = __dirname + "/../app/templates/mail/" + template;
  var msg = ejs.render(String(fs.readFileSync(path)), { job: job });

  sendMail({
    from: FROM,
    to: job.mail,
    subject: subjectPrefix + job._id,
    text: msg
  });
};

var sendJobComplete = function(job) {
  sendTemplate("jobcompleted.ejs", "Your Job Has Completed: ", job);
};

var sendJobError = function(job) {
  sendTemplate("joberror.ejs", "Something went wrong with your job: ", job);
};

exports.sendMail = sendMail;
exports.sendJobComplete = sendJobComplete;
exports.sendJobError = sendJobError;
