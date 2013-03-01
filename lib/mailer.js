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

