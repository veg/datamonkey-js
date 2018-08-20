var fs = require("fs"),
  mongoose = require("mongoose"),
  should = require("should"),
  seqio = require("../lib/biohelpers/sequenceio.js");

describe("seqio", function() {
  it("parse fasta file with sequences", function(done) {
    var options = {
      "no-equal-length": 0,
      "headers-only": 0,
      "progress-callback": function() {}
    };

    var cb = function(err, data) {
      data.forEach(function(d) {
        d.should.have.property("seq");
        d.should.have.property("name");
      });

      done();
    };

    seqio.parseFile("./test/res/Flu.fasta", cb, options);
  });
});
