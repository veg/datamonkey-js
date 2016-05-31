
var logger = require(__dirname + '/logger');
    setup = require(__dirname + '/../config/setup');

var helpers       = require(__dirname + '/helpers'),
    nodemailer    = require('nodemailer'),
    sendmailTransport = require('nodemailer-sendmail-transport'),
    jade          = require('jade'),
    fs            = require('fs'),
    ejs           = require('ejs');

var sendJobComplete = function(job) {

  var transport = nodemailer.createTransport(
     sendmailTransport({
      path: setup.sendmail_path
    }) 
  );

  var path = __dirname + '/../app/templates/mail/jobcompleted.ejs';
  var subject =  "Your Job Has Completed: " + job._id;
  msg = ejs.render(String(fs.readFileSync(path)), {'job': job});

  var mailOptions = {
    from    : "datamonkey <no-reply@datamonkey.org>",
    to      : job.mail, 
    subject : subject,
    text    : msg
  };

  // send mail with defined transport object
  transport.sendMail(mailOptions, function (error, response) {

    // setup e-mail data with unicode symbols
    if (error) {
      logger.error(error);
    }

    // If you don't want to use this transport object anymore, 
    // uncomment following line
    transport.close();
  
  });

};

var sendJobError = function(job) {

  var transport = nodemailer.createTransport(
     sendmailTransport({
      path: setup.sendmail_path
    }) 
  );

  var path = __dirname + '/../app/templates/mail/joberror.ejs';
  var subject =  "Something went wrong with your job: " + job._id;
  msg = ejs.render(String(fs.readFileSync(path)), {'job': job});

  var mailOptions = {
    from    : "datamonkey <no-reply@datamonkey.org>",
    to      : job.mail, 
    subject : subject,
    text    : msg
  };

  // send mail with defined transport object
  transport.sendMail(mailOptions, function (error, response) {

    // setup e-mail data with unicode symbols
    if (error) {
      logger.error(error);
    }

    // If you don't want to use this transport object anymore, 
    // uncomment following line
    transport.close();
  
  });

};

exports.sendJobComplete = sendJobComplete;
exports.sendJobError = sendJobError;
