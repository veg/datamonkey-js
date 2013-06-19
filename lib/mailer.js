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

var globals    = require('../config/globals.js');
var nodemailer = require("nodemailer");
var jade       = require('jade');

function composeUrl(analysis, msa) {
  //http://datamonkey-dev/spool/upload.651944536012447.1_meme.php
  var url = "http://" + globals.host + "/spool/" + msa.msaid + "_"
            + analysis.type + ".php";
  return url;
}

// Create mail
var sendJobComplete = function (analysis, msa) {

  var transport = nodemailer.createTransport("sendmail");
  var path = './app/templates/mail/completedjob.jade';
  var str  = require('fs').readFileSync(path, 'utf8');
  var fn   = jade.compile(str, { filename: path, pretty: true });
  var url = composeUrl(analysis, msa);

  var params = {
      msaid      : msa.msaid,
      analysisid : analysis.id,
      type       : analysis.type.capitalize(),
      url        : url
    };

  var subject =  msa.msaid + ": " + analysis.type.capitalize() + " " + 
                 analysis.id + " Completed"

  var msg = fn({ params: params });

  var mailOptions = {
    from    : "datamonkey <no-reply@datamonkey.org>",
    to      : msa.mailaddr, // list of receivers
    subject : subject,
    text    : msg, // plaintext body
    //html  : msg // html body

  };

  // send mail with defined transport object
  transport.sendMail(mailOptions, function (error, response) {

    // setup e-mail data with unicode symbols
    if (error) {
      console.log(error);
    }

    // If you don't want to use this transport object anymore, 
    // uncomment following line
    transport.close();

  });

}

exports.send = sendJobComplete;

