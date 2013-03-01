//Also needs to include status, and results
var mongoose = require('mongoose');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

//TODO: status needs to be a subdocument
var Gard = new Schema({
  msafn      : { type: Schema.Types.ObjectId, ref: 'MSA' },
  status     : String,
  sendmail   : Boolean,
  parameters : [GardParameters],
  slac_model : [SlacModel],
  splits     : [GardSplits],
  details    : [GardDetails],
  summary    : [GardSummary]
});

var GardParameters = new Schema({
  modelstring : String,
  treemode    : Number,
  pvalue      : Number,
});

var GardSplits = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Gard' },
  part  : Number,
  left  : Number,
  right : Number,
  tree  : String,
  khl   : Number,
  khr   : Number
});

var GardDetails = new Schema({
  _creator   : { type: Schema.Types.ObjectId, ref: 'Gard' },
  site       : Number,
  bpsupport  : Number,
  treelength : Number  
});

var GardSummary = new Schema({
  _creator  : { type: Schema.Types.ObjectId, ref: 'Gard' },
  col_key   : String,
  col_value : String
});

module.exports = mongoose.model('Gard', Gard);
module.exports = mongoose.model('GardSplits', GardSplits);
module.exports = mongoose.model('GardDetails', GardDetails);
module.exports = mongoose.model('GardSummary', GardSummary);
