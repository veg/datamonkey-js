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
    extend  = require('mongoose-schema-extend'),
    winston = require('winston'),
    path = require('path'),
    Msa = require(path.join(__dirname, '/msa'));

var AnalysisSchema = require(path.join(__dirname, '/analysis'));

var Fade = AnalysisSchema.extend({
  fg_branches           : String,
  last_status_msg       : String,
  results               : Object
});

Fade.virtual('analysistype').get(function() {
  return 'fade';
});

Fade.virtual('pmid').get(function() {
  return 'NA';
});

/**
 * Filename of document's file upload
 */
Fade.virtual('status_stack').get(function () {
  return ['queue', 
          'running',
          'completed'];
});

/**
 * Complete file path for document's file upload
 */
Fade.virtual('filepath').get(function () {
  return path.join(__dirname, '/../../uploads/msa/', this._id + '.fasta');
});

/**
 * URL for a fade path
 */
Fade.virtual('url').get(function () {
  return 'http://' + setup.host + '/fade/' + this._id;
});


module.exports = mongoose.model('Fade', Fade);
