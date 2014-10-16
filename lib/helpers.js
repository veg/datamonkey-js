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

var winston = require('winston');
var fs = require('fs');
var path = require('path');

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.camelCase = function (delim) {
  delim = delim ? delim : ' ';
  return this.toLowerCase().split( delim ).map( function(v) { return v.capitalize() } ).join('');
}

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({'timestamp':true})
    ]
});


exports.logger = logger;


/*
  Taken from http://stackoverflow.com/a/14387791
 */
exports.copyFile = function(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}

/*
  Does a rename if target is on the same device as source.
  Otherwise copies source to target and deletes source.
  */
exports.moveSafely = function(source, target, cb) {
  var srcStat = fs.statSync(source);
  var dstStat = fs.statSync(path.dirname(target));
  if(srcStat.dev == dstStat.dev) {
    fs.rename(source, target, cb);
  } else {
    exports.copyFile(source, target, function(err) {
      if (err) {
        cb(error);
      } else {
        fs.unlink(source, cb);
      }
    });
  }
}
