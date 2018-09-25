var fs = require("fs"),
  mongoose = require("mongoose"),
  should = require("should");

// Bootstrap models
require("../app/models/busted");

var Busted = mongoose.model("Busted"),
  mailer = require("../lib/mailer.js");

describe("mailer", function() {
  var busted = new Busted();
  busted.mail = "no-reply@datamonkey.org";

  it("should send mail", function(done) {
    mailer.sendJobComplete(busted);
    done();
  });
});
