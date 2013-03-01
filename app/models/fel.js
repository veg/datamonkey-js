//Also needs to include status, and results
var mongoose = require('mongoose');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

//TODO: status needs to be a subdocument
var FEL = new Schema({
  msafn      : { type: Schema.Types.ObjectId, ref: 'MSA' },
  status     : String,
  sendmail   : Boolean,
  parameters : [FELParameters],
  results    : [FELResults],
  summary    : [FELSummary]
});

var FELParameters = new Schema({
  //TODO: Find this out
  modelstring : String,
  treemode    : Number,
  pvalue      : Number,
});

var FELResults = new Schema({
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

var FELSummary = new Schema({
  _creator  : { type: Schema.Types.ObjectId, ref: 'FEL' },
  col_key   : String,
  col_value : String
});

module.exports = mongoose.model('FEL', FEL);
module.exports = mongoose.model('FELParameters', FELParameters);
module.exports = mongoose.model('FELResults', FELResults);
module.exports = mongoose.model('FELSummary', FELSummary);

