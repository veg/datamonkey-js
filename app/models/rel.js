//Also needs to include status, and results
var mongoose = require('mongoose');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

//TODO: status needs to be a subdocument
var REL = new Schema({
  msafn                 : { type : Schema.Types.ObjectId, ref : 'MSA' },
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
  fubar_results         : [FubarResults],
  fubar_grid            : [FubarGrid],
  fubar_summary         : [FubarSummary],
  fubar_site_info       : [FubarSite_info],
  fubar_mcmc_trace      : [FubarMcmc_trace],
  meme_results          : [MemeResults],
  meme_mappings         : [MemeMappings],
  meme_summary          : [MemeSummary],
  evf_samples           : [EvfSamples],
  evf_posterior_samples : [EvfPosterior_samples],
  evf_posteriors        : [EvfPosteriors],
  evf_summary           : [EvfSummary],
  evf_rate_info_summary : [EvfRate_info_summary],
});

var RELParameters = new Schema({
  //TODO: Find this out
  modelstring : String,
  treemode    : Number,
  pvalue      : Number,
});

var RELDistributions = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'FEL' },
  variable : String,
  rate     : Number,
  Value    : Number,
  Prob     : Number 
});

var RELResults = new Schema({
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

var RELSummary = new Schema({
  _creator  : { type: Schema.Types.ObjectId, ref: 'FEL' },
  col_key   : String,
  col_value : String
});

module.exports = mongoose.model('REL', REL);
module.exports = mongoose.model('RELParameters', RELParameters);
module.exports = mongoose.model('RELDistibutions', RELDistibutions);
module.exports = mongoose.model('RELResults', RELResults);
module.exports = mongoose.model('RELSummary', RELSummary);
