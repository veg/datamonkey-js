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


var fs = require('fs'),
    mongoose = require('mongoose'),
    spawn = require('child_process').spawn
    setup = require('../config/setup');

// Bootstrap models
var models_path = '../app/models';

fs.readdirSync(models_path).forEach(function (file) {
  require(models_path+'/'+file);
});


var Msa     = mongoose.model('Msa'),
    should  = require('should');

describe('msa datareader validation', function() {

  var Msa  = mongoose.model('Msa');

  it('run hyphy', function(done) {
    var hyphy =  spawn(setup.hyphy,
                      [setup.rootpath + "/lib/bfs/datareader.bf"]);

    hyphy.stdout.on('data', function (data) {
      console.log('' + data);
    });

    hyphy.stdin.write(__dirname + '/res/HIV_gp121.nex\n');
    hyphy.stdin.write('0');
    hyphy.stdin.end();
    hyphy.on('close', function (code) {
      console.log('child process exited with code ' + code);
      done();
    });
  });

});


