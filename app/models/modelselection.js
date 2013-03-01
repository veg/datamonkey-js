//Also needs to include status, and results
var mongoose = require('mongoose')
  , FelResults = mongoose.model('FelResults')
  , FelSummary = mongoose.model('FelSummary');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

//TODO: status needs to be a subdocument
//TODO: Include SLAC
var ModelSelection = new Schema({
  msafn         : { type: Schema.Types.ObjectId, ref: 'MSA' },
  status        : String,
  sendmail      : Boolean,
  parameters    : [ModelSelectionParameters],
  slac_model    : [SlacModel],
  slac_results  : [SlacResults],
  slac_mutation : [SlacMutation],
  slac_summary  : [SlacSummary],
  slac_trees    : [SlacTrees],
  fel_results   : [FelResults],
  fel_summary   : [FelSummary]
});

var ModelSelectionParameters = new Schema({
  modelstring : String,
  treemode    : Number,
  pvalue      : Number,
});

module.exports = mongoose.model('ModelSelection', ModelSelection);
module.exports = mongoose.model('ModelSelectionParameters', ModelSelectionParameters);
