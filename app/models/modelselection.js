//Also needs to include status, and results
require(__dirname + '/slac');
require(__dirname + '/fel');

var mongoose = require('mongoose')
  , SlacModel    = mongoose.model('SlacModel')
  , SlacResults  = mongoose.model('SlacResults')
  , SlacMutation = mongoose.model('SlacMutation')
  , SlacSummary  = mongoose.model('SlacSummary')
  , SlacTrees    = mongoose.model('SlacTrees')
  , FelResults   = mongoose.model('FelResults')
  , FelSummary   = mongoose.model('FelSummary');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

//TODO: status needs to be a subdocument
//TODO: Include SLAC
var ModelSelection = new Schema({
  msafn         : { type: Schema.Types.ObjectId, ref: 'Msa' },
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
});

module.exports = mongoose.model('ModelSelection', ModelSelection);
module.exports = mongoose.model('ModelSelectionParameters', ModelSelectionParameters);
