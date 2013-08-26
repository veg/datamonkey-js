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

var setup    = require( ROOT_PATH + '/config/setup');

var mongoose = require('mongoose'),
    moment   = require('moment'),
    check    = require('validator').check,
    globals  = require( ROOT_PATH + '/config/globals.js'),
    sanitize = require('validator').sanitize

var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var HivCluster = new Schema({
    distance_threshold : { type: Number, min : 0, max: 0.02 },
    min_overlap        : { type: Number, min : 100, max: 1000 },
    ambiguity_handling : String,
    mailaddr           : String,
    status             : String,
    graph_dot          : String,
    cluster_csv        : String,
    created            : {type   : Date, default : Date.now}
});

HivCluster.virtual('filename').get(function () {
  return this._id;
});


HivCluster.virtual('filepath').get(function () {
  return setup.root_hivcluster_path + this._id;
});


module.exports = mongoose.model('HivCluster', HivCluster);
