/*

  Datamonkey - An API for comparative analysis of sequence alignments using state-of-the-art statistical models.

  Copyright (C) 2014
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

var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');

var MsaSchema  = require(__dirname + '/msa');
var AnalysisSchema = require(__dirname + '/analysis');

//TODO: Include an MSA
var Busted = AnalysisSchema.extend({
  msa                   : [MsaSchema.Msa],
  treemode              : Number,
  tagged_nwk_tree       : String,
  mail                  : String,
  results               : Object
});

/**
 * Filename of document's file upload
 */
Busted.virtual('status_stack').get(function () {
  return ['In Queue', 
          'Running',
          'Completed'];
});

/**
 * Complete file path for document's file upload
 */
Busted.virtual('filepath').get(function () {
  return __dirname + '/../../uploads/msa/' + this._id + '.fasta';
});

/**
 * URL for a busted path
 */
Busted.virtual('url').get(function () {
  return 'http://' + setup.host + '/busted/' + this._id;
});


module.exports = mongoose.model('Busted', Busted);
