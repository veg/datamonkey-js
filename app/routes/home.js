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

var mongoose = require('mongoose'),
    globals  = require( ROOT_PATH + '/config/globals.js');

//find sequence by id
exports.homePage = function (req, res) {
  res.render('index.ejs');
};

//find sequence by id
exports.help = function (req, res) {
  res.render('help.ejs');
};

exports.jobQueue = function(req, res) {

  var all_jobs = [];

  //Need a count to know when to callback
  var count = 0;

  // Gather all queueing and running jobs
  for(var t in globals.types) {
    Analysis = mongoose.model(t.capitalize());
    Analysis.jobs(function(err, respective_jobs){
      all_jobs.push(respective_jobs);
      count++;
      if(count == Object.keys(globals.types).length) {
        res.render('jobqueue.ejs', { "jobs" : respective_jobs , 
                                     "globals" : globals } );
      }
    });
  }
}

exports.stats = function (req, res) {
  res.render('stats.ejs', {'types' : globals.types });
};

