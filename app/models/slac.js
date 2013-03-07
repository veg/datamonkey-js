var mongoose = require('mongoose');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

//TODO: status needs to be a subdocument
//TODO: Include SLAC
var Slac = new Schema({
  msafn        : { type: Schema.Types.ObjectId, ref: 'Msa' },
  status       : String,
  sendmail     : Boolean,
  parameters   : [SlacParameters],
  summary      : [SlacSummary],
  mutation     : [SlacMutation],
  trees        : [SlacTrees],
  model        : [SlacModel],
  results      : [SlacResults],
});

var SlacParameters = new Schema({
  modelstring : String,
  treemode    : Number,
  pvalue      : Number,
});


var SlacTrees = new Schema({
  _creator    : { type   : Schema.Types.ObjectId, ref : 'Slac' },
  site        : Number,
  tree1       : String,
  tree2       : String,
  tree1length : Number,
  tree2length : Number,
  aic         : Number,
  caic        : Number,
  bic         : Number,
  waic        : Number,
  wcaic       : Number,
  wbic        : Number,
  splitsmatch : Number,
  rf          : Number
});

var SlacModel = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Slac' },
});

var SlacMutation = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Slac' },
});

var SlacResults = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Slac' },
});

var SlacSummary = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Slac' },
  col_key   : String,
  col_value : String
});

module.exports = mongoose.model('Slac', Slac);
module.exports = mongoose.model('SlacParameters', SlacParameters);
module.exports = mongoose.model('SlacSummary', SlacSummary);
module.exports = mongoose.model('SlacMutation', SlacMutation)
module.exports = mongoose.model('SlacTrees', SlacTrees)
module.exports = mongoose.model('SlacModel', SlacModel)
module.exports = mongoose.model('SlacResults', SlacResults)

