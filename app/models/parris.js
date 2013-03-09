//Also needs to include status, and results
require(__dirname + '/meme');
require(__dirname + '/fubar');

var mongoose = require('mongoose')
  , SlacResults   = mongoose.model('SlacResults')
  , SlacMutation  = mongoose.model('SlacMutation')
  , SlacSummary   = mongoose.model('SlacSummary')
  , SlacTrees     = mongoose.model('SlacTrees')
  , MemeResults   = mongoose.model('MemeResults')
  , MemeMappings  = mongoose.model('MemeMappings')
  , MemeSummary   = mongoose.model('MemeSummary')
  , FubarResults  = mongoose.model('FubarResults')
  , FubarGrid     = mongoose.model('FubarGrid')
  , FubarSummary  = mongoose.model('FubarSummary')
  , FubarSiteInfo = mongoose.model('FubarSiteInfo')
  , FubarMcmcTrace= mongoose.model('FubarMcmcTrace');
  

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

//TODO: status needs to be a subdocument
var Parris = new Schema({
  msafn            : { type: Schema.Types.ObjectId, ref: 'Msa' },
  status           : String,
  sendmail         : Boolean,
  parameters       : [ParrisParameters],
  distributions    : [ParrisDistributions],
  summary          : [ParrisSummary],
  slac_results     : [SlacResults],
  slac_mutation    : [SlacMutation],
  slac_summary     : [SlacSummary],
  slac_trees       : [SlacTrees],
  meme_results     : [MemeResults],
  meme_mappings    : [MemeMappings],
  meme_summary     : [MemeSummary],
  fubar_results    : [FubarResults],
  fubar_grid       : [FubarGrid],
  fubar_summary    : [FubarSummary],
  fubar_site_info  : [FubarSiteInfo],
  fubar_mcmc_trace : [FubarMcmcTrace],
});

var ParrisParameters = new Schema({
  modelstring : String,
  treemode    : Number,
  pvalue      : Number,
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
module.exports = mongoose.model('ParrisParameters', ParrisParameters);
module.exports = mongoose.model('ParrisDistributions', ParrisDistributions);
module.exports = mongoose.model('ParrisSummary', ParrisSummary);

