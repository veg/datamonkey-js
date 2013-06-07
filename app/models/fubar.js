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
SlacSchema = require(__dirname + '/slac');
SbpSchema  = require(__dirname + '/sbp');
FelSchema  = require(__dirname + '/fel');
MemeSchema = require(__dirname + '/meme');
EvfSchema  = require(__dirname + '/evf');

var mongoose = require('mongoose');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

var Fubar = new Schema({
  msafn               : { type                 : Schema.Types.ObjectId, ref : 'Msa' },
  status              : String,
  id                  : Number,
  sendmail            : Boolean,
  parameters          : [FubarParameters],
  fubarresults        : [FubarResults],
  fubargrid           : [FubarGrid],
  fubarsummary        : [FubarSummary],
  fubarsiteinfo       : [FubarSiteInfo],
  fubarmcmctrace      : [FubarMcmcTrace],
  reldistributions    : [RelDistributions],
  relresults          : [RelResults],
  relsummary          : [RelSummary],
  sbpsummary          : [SbpSchema.SbpSummary],
  sbptrees            : [SbpSchema.SbpTrees],
  slacmodel           : [SlacSchema.SlacModel],
  slacresults         : [SlacSchema.SlacResults],
  slacmutation        : [SlacSchema.SlacMutation],
  slacsummary         : [SlacSchema.SlacSummary],
  slactrees           : [SlacSchema.SlacTrees],
  felresults          : [FelSchema.FelResults],
  felsummary          : [FelSchema.FelSummary],
  memeresults         : [MemeSchema.MemeResults],
  mememappings        : [MemeSchema.MemeMappings],
  memesummary         : [MemeSchema.MemeSummary],
  evfsamples          : [EvfSchema.EvfSamples],
  evfposteriorsamples : [EvfSchema.EvfPosteriorSamples],
  evfposteriors       : [EvfSchema.EvfPosteriors],
  evfsummary          : [EvfSchema.EvfSummary],
  evfrateinfosummary  : [EvfSchema.EvfRateInfoSummary],
});

var FubarParameters = new Schema({
  treemode    : Number,
  pvalue      : Number,
});

var FubarResults = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Fubar' },
  codon   : Number,
  alpha   : Number,
  beta    : Number,
  dnmds   : Number,
  possel  : Number,
  negsel  : Number,
  psr     : Number,
  neff    : Number,
  var     : Number,
  ebf     : Number
});

var FubarMcmcTrace = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Fubar' },
  sample   : Number,
  logl     : Number
});

var FubarSiteInfo = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Fubar' },
  codon  : Number,
  alpha  : Number,
  beta   : Number,
  weight : Number,
  prob   : Number
});

var FubarGrid = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Fubar' },
  logl   : Number,
  weight : Number,
  alpha  : Number,
  beta   : Number
});

var FubarSummary = new Schema({
  _creator  : { type: Schema.Types.ObjectId, ref: 'Fubar' },
  col_key   : String,
  col_value : String
});

var RelDistributions = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'FEL' },
  variable : String,
  rate     : Number,
  Value    : Number,
  Prob     : Number 
});

var RelResults = new Schema({
  _creator       : { type: Schema.Types.ObjectId, ref: 'FEL' },
  codon          : Number,
  ds             : Number,
  dn             : Number,
  neutral_ds     : Number,
  logl           : Number,
  lrt            : Number,
  p              : Number,
  scaleddnds     : Number
});

var RelSummary = new Schema({
  _creator  : { type: Schema.Types.ObjectId, ref: 'FEL' },
  col_key   : String,
  col_value : String
});

module.exports = mongoose.model('Fubar', Fubar);
module.exports = mongoose.model('FubarSummary', FubarSummary);
module.exports = mongoose.model('FubarParameters', FubarParameters);
module.exports = mongoose.model('FubarMcmcTrace', FubarMcmcTrace);
module.exports = mongoose.model('FubarSiteInfo', FubarSiteInfo);
module.exports = mongoose.model('FubarGrid', FubarGrid);
module.exports = mongoose.model('FubarResults', FubarResults);
module.exports = mongoose.model('RelDistributions', RelDistributions);
module.exports = mongoose.model('RelResults', RelResults);
module.exports = mongoose.model('RelSummary', RelSummary);
