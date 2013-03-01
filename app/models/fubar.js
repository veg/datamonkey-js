//Also needs to include status, and results
var mongoose = require('mongoose')
  , MemeResults = mongoose.model('MemeResults')
  , MemeMappings = mongoose.model('MemeMappings')
  , MemeSummary = mongoose.model('MemeSummary');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

//TODO: status needs to be a subdocument
//TODO: status needs to be a subdocument
var Fubar = new Schema({
  msafn                   : { type: Schema.Types.ObjectId, ref: 'MSA' },
  status                  : String,
  sendmail                : Boolean,
  parameters              : [FubarParameters],
  results                 : [FubarResults],
  grid                    : [FubarGrid],
  summary                 : [FubarSummary],
  site_info               : [FubarSiteInfo],
  mcmc_trace              : [FubarMcmcTrace],
  slac_model              : [SlacModel],
  sbp_summary             : [SbpSummary],
  sbp_trees               : [SbpTrees],
  slac_results            : [SlacResults],
  slac_mutation           : [SlacMutation],
  slac_summary            : [SlacSummary],
  slac_trees              : [SlacTrees],
  fel_results             : [FelResults],
  fel_summary             : [FelSummary],
  meme_results            : [MemeResults],
  meme_mappings           : [MemeMappings],
  meme_summary            : [MemeSummary],
  rel_distributions       : [RelDistributions],
  rel_results             : [RelResults],
  rel_summary             : [RelSummary],
  evf_samples             : [EvfSamples],
  evf_posterior_samples   : [EvfPosteriorSamples],
  evf_posteriors          : [EvfPosteriors],
  evf_summary             : [EvfSummary],
  evf_rate_info_summary   : [EvfRateInfoSummary],
});

var FubarParameters = new Schema({
  //TODO: Figure out variables
  modelstring : String,
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
