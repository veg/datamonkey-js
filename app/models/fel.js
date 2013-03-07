//Also needs to include status, and results
var mongoose = require('mongoose');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

//TODO: status needs to be a subdocument
var Fel = new Schema({
  msafn      : { type: Schema.Types.ObjectId, ref: 'Msa' },
  status     : String,
  sendmail   : Boolean,
  parameters : [FelParameters],
  results    : [FelResults],
  summary    : [FelSummary]
});

var FelParameters = new Schema({
  //TODO: Find this out
  modelstring : String,
  treemode    : Number,
  pvalue      : Number,
});

var FelResults = new Schema({
  _creator   : { type: Schema.Types.ObjectId, ref: 'FEL' },
  codon      : Number,
  ds         : Number,
  dn         : Number,
  neutral_ds : Number,
  logl       : Number,
  lrt        : Number,
  p          : Number,
  scaleddnds : Number
});

var FelSummary = new Schema({
  _creator  : { type: Schema.Types.ObjectId, ref: 'FEL' },
  col_key   : String,
  col_value : String
});

module.exports = mongoose.model('Fel', Fel);
module.exports = mongoose.model('FelParameters', FelParameters);
module.exports = mongoose.model('FelResults', FelResults);
module.exports = mongoose.model('FelSummary', FelSummary);

