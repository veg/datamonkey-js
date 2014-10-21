/*

  Datamonkey - An API for comparative analysis of sequence alignments using state-of-the-art statistical models.

  Copyright (C) 2013
  Sergei L Kosakovsky Pond (spond@ucsd.edu)
  Steven Weaver (sweaver@ucsd.edu)

  Permission is hereby granted, free of charge, to any person obtaining a
  copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be included
  in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

var logger = require(__dirname + '/logger');
    setup = require(__dirname + '/../config/setup');

var globals       = require(__dirname + '/../config/globals.js'),
    helpers       = require(__dirname + '/helpers'),
    nodemailer    = require('nodemailer'),
    sendmailTransport = require('nodemailer-sendmail-transport'),
    jade          = require('jade'),
    fs            = require('fs'),
    ejs           = require('ejs');

function composeUrl(analysis, msa) {
  //http://datamonkey-dev/spool/upload.651944536012447.1_meme.php
  var url = "http://" + HOST + "/spool/" + msa.upload_id + "_"
            + analysis.type + ".php";
  return url;
}

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

}

exports.sendJobComplete = sendJobComplete;
