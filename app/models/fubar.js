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
require(__dirname + '/slac');
require(__dirname + '/sbp');
require(__dirname + '/fel');
require(__dirname + '/meme');
require(__dirname + '/rel');
require(__dirname + '/evf');

var mongoose            = require('mongoose')
  , SbpSummary          = mongoose.model('SbpSummary')
  , SbpTrees            = mongoose.model('SbpTrees')
  , SlacModel           = mongoose.model('SlacModel')
  , SlacResults         = mongoose.model('SlacResults')
  , SlacMutation        = mongoose.model('SlacMutation')
  , SlacSummary         = mongoose.model('SlacSummary')
  , SlacTrees           = mongoose.model('SlacTrees')
  , FelResults          = mongoose.model('FelResults')
  , FelSummary          = mongoose.model('FelSummary')
  , MemeResults         = mongoose.model('MemeResults')
  , MemeMappings        = mongoose.model('MemeMappings')
  , MemeSummary         = mongoose.model('MemeSummary')
  , RelDistributions    = mongoose.model('RelDistributions')
  , RelResults          = mongoose.model('RelResults')
  , RelSummary          = mongoose.model('RelSummary')
  , EvfSamples          = mongoose.model('EvfSamples')
  , EvfPosteriorSamples = mongoose.model('EvfPosteriorSamples')
  , EvfPosteriors       = mongoose.model('EvfPosteriors')
  , EvfSummary          = mongoose.model('EvfSummary')
  , EvfRateInfoSummary  = mongoose.model('EvfRateInfoSummary');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

//TODO: status needs to be a subdocument
var Fubar = new Schema({
  msafn               : { type                 : Schema.Types.ObjectId, ref : 'Msa' },
  status              : String,
  sendmail            : Boolean,
  parameters          : [FubarParameters],
  fubarresults        : [FubarResults],
  fubargrid           : [FubarGrid],
  fubarsummary        : [FubarSummary],
  fubarsiteinfo       : [FubarSiteInfo],
  fubarmcmctrace      : [FubarMcmcTrace],
  sbpsummary          : [SbpSummary],
  sbptrees            : [SbpTrees],
  slacmodel           : [SlacModel],
  slacresults         : [SlacResults],
  slacmutation        : [SlacMutation],
  slacsummary         : [SlacSummary],
  slactrees           : [SlacTrees],
  felresults          : [FelResults],
  felsummary          : [FelSummary],
  memeresults         : [MemeResults],
  mememappings        : [MemeMappings],
  memesummary         : [MemeSummary],
  reldistributions    : [RelDistributions],
  relresults          : [RelResults],
  relsummary          : [RelSummary],
  evfsamples          : [EvfSamples],
  evfposteriorsamples : [EvfPosteriorSamples],
  evfposteriors       : [EvfPosteriors],
  evfsummary          : [EvfSummary],
  evfrateinfosummary  : [EvfRateInfoSummary],
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

module.exports = mongoose.model('Fubar', Fubar);
module.exports = mongoose.model('FubarSummary', FubarSummary);
module.exports = mongoose.model('FubarParameters', FubarParameters);
module.exports = mongoose.model('FubarMcmcTrace', FubarMcmcTrace);
module.exports = mongoose.model('FubarSiteInfo', FubarSiteInfo);
module.exports = mongoose.model('FubarGrid', FubarGrid);
module.exports = mongoose.model('FubarResults', FubarResults);
