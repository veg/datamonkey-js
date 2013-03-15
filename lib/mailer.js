/*

  HyPhy - Hypothesis Testing Using Phylogenies.

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


var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
sender = function(addr) {

  var transport = nodemailer.createTransport("sendmail");

  var mailOptions = {
    from: "datamonkey <no-reply@datamonkey.org>", // sender address
    to: addr, // list of receivers
    subject: "Your datamonkey job has completed", // Subject line
    text: "Congrats, your job has completed", // plaintext body
    html: "<b>Congrats, your job has completed</b>" // html body
  }

  // send mail with defined transport object
  transport.sendMail(mailOptions, function(error, response){

    // setup e-mail data with unicode symbols
    if(error){
      console.log(error);
    }

    else{
      //TODO: We should always log this in the logger
      //console.log("Message sent: " + response.message);
    }

    // If you don't want to use this transport object anymore, uncomment following line
    // smtpTransport.close(); // shut down the connection pool, no more messages
  });

}

exports.send = sender;

