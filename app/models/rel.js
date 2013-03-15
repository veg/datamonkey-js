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
//require(__dirname + '/fubar');
require(__dirname + '/meme');
require(__dirname + '/evf');


var mongoose             = require('mongoose')
  , FelResults           = mongoose.model('FelResults')
  , FelSummary           = mongoose.model('FelSummary')
  , SlacModel            = mongoose.model('SlacModel')
  , SbpSummary           = mongoose.model('SbpSummary')
  , SbpTrees             = mongoose.model('SbpTrees')
  , SlacResults          = mongoose.model('SlacResults')
  , SlacMutation         = mongoose.model('SlacMutation')
  , SlacSummary          = mongoose.model('SlacSummary')
  , SlacTrees            = mongoose.model('SlacTrees')
  //, FubarResults         = mongoose.model('FubarResults')
  //, FubarGrid            = mongoose.model('FubarGrid')
  //, FubarSummary         = mongoose.model('FubarSummary')
  //, FubarSite_info       = mongoose.model('FubarSite_info')
  //, FubarMcmc_trace      = mongoose.model('FubarMcmc_trace')
  , MemeResults          = mongoose.model('MemeResults')
  , MemeMappings         = mongoose.model('MemeMappings')
  , MemeSummary          = mongoose.model('MemeSummary')
  , EvfSamples           = mongoose.model('EvfSamples')
  , EvfPosterior_samples = mongoose.model('EvfPosteriorSamples')
  , EvfPosteriors        = mongoose.model('EvfPosteriors')
  , EvfSummary           = mongoose.model('EvfSummary')
  , EvfRate_info_summary = mongoose.model('EvfRateInfoSummary');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

//TODO: status needs to be a subdocument
var Rel = new Schema({
  msafn                 : { type : Schema.Types.ObjectId, ref : 'Msa' },
  status                : String,
  sendmail              : Boolean,
  distributions         : [RelDistributions],
  results               : [RelResults],
  summary               : [RelSummary],
  fel_results           : [FelResults],
  fel_summary           : [FelSummary],
  slac_model            : [SlacModel],
  sbp_summary           : [SbpSummary],
  sbp_trees             : [SbpTrees],
  slac_results          : [SlacResults],
  slac_mutation         : [SlacMutation],
  slac_summary          : [SlacSummary],
  slac_trees            : [SlacTrees],
  //fubar_results         : [FubarResults],
  //fubar_grid            : [FubarGrid],
  //fubar_summary         : [FubarSummary],
  //fubar_site_info       : [FubarSite_info],
  //fubar_mcmc_trace      : [FubarMcmc_trace],
  meme_results          : [MemeResults],
  meme_mappings         : [MemeMappings],
  meme_summary          : [MemeSummary],
  evf_samples           : [EvfSamples],
  evf_posterior_samples : [EvfPosterior_samples],
  evf_posteriors        : [EvfPosteriors],
  evf_summary           : [EvfSummary],
  evf_rate_info_summary : [EvfRate_info_summary],
});

var RelParameters = new Schema({
  modelstring : String,
  treemode    : Number,
  pvalue      : Number,
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

module.exports = mongoose.model('Rel', Rel);
module.exports = mongoose.model('RelParameters', RelParameters);
module.exports = mongoose.model('RelDistributions', RelDistributions);
module.exports = mongoose.model('RelResults', RelResults);
module.exports = mongoose.model('RelSummary', RelSummary);
