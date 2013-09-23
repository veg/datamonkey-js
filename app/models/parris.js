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



//Also needs to include status, and results
var SlacSchema = require(__dirname + '/slac');
var MemeSchema = require(__dirname + '/meme');
var FubarSchema = require(__dirname + '/fubar');

var mongoose = require('mongoose'),
  extend = require('mongoose-schema-extend');

var AnalysisSchema = require(__dirname + '/analysis');

var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var Parris = AnalysisSchema.extend({
  modelstring         : {type: String},
  treemode            : {type: Number},
  pvalue              : {type: Number},
  parrisdistributions : [ParrisDistributions],
  parrissummary       : [ParrisSummary],
  slacresults         : [SlacSchema.SlacResults],
  slacmutation        : [SlacSchema.SlacMutation],
  slacsummary         : [SlacSchema.SlacSummary],
  slactrees           : [SlacSchema.SlacTrees],
  memeresults         : [MemeSchema.MemeResults],
  mememappings        : [MemeSchema.MemeMappings],
  memesummary         : [MemeSchema.MemeSummary],
  fubarresults        : [FubarSchema.FubarResults],
  fubargrid           : [FubarSchema.FubarGrid],
  fubarsummary        : [FubarSchema.FubarSummary],
  fubarsiteinfo       : [FubarSchema.FubarSiteInfo],
  fubarmcmctrace      : [FubarSchema.FubarMcmcTrace],
});

var ParrisDistributions = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Parris' },
  variable : String,
  rate     : Number,
  value    : Number,
  prob     : Number
});

var ParrisSummary = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Parris' },
  col_key   : String,
  col_value : String
});

module.exports = mongoose.model('Parris', Parris);
module.exports = mongoose.model('ParrisDistributions', ParrisDistributions);
module.exports = mongoose.model('ParrisSummary', ParrisSummary);

