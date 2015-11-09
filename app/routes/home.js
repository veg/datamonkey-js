/*

  Datamonkey - An API for comparative analysis of sequence alignments using state-of-the-art statistical models.

  Copyright (C) 2015
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
    moment = require('moment'),
    path = require('path'),
    hpcsocket = require(path.join(__dirname, '/../../lib/hpcsocket.js')),
    globals  = require(path.join(__dirname, '/../../config/globals.js'));

exports.homePage = function (req, res) {
  res.render('index.ejs');
};

exports.help = function (req, res) {
  res.render('help.ejs');
};

exports.development = function (req, res) {
  res.render('development.ejs');
};

exports.analyses = function (req, res) {
  res.render('analyses.ejs');
};

exports.treeviewer = function (req, res) {
  res.render('tools/treeviewer.ejs');
};

exports.copyright = function (req, res) {
  res.render ('copyright.ejs');
}

exports.data_privacy = function (req, res) {
  res.render ('data.ejs');
}

exports.jobQueue = function(req, res) {

  function connect_callback(result) {

   var jobs = result;

    res.format({
      json: function() {
        res.json(200, jobs);
      }
    });
  }


  // retrieve job queue from cluster
  var jobproxy = new hpcsocket.JobQueue(connect_callback);



};

exports.jobQueuePage = function(req, res) {
  res.render('jobqueue.ejs');
};


exports.clusterhealth= function (req, res) {

  function connect_callback(result) {
    res.json(200, result);
  }

  var jobproxy = new hpcsocket.ClusterStatus(connect_callback);

};

exports.stats = function (req, res) {
  res.render('stats.ejs', {'types' : globals.types });
};

exports.stats_test = function (req, res) {
  res.render('stats_test.ejs', {'types' : globals.types });
};

