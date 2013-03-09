require(__dirname + '/slac');
require(__dirname + '/gard');

var mongoose = require('mongoose')
  , SlacModel = mongoose.model('SlacModel')
  , GardSplits = mongoose.model('GardSplits')
  , GardSummary = mongoose.model('GardSummary')
  , GardDetails = mongoose.model('GardDetails');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

//TODO: status needs to be a subdocument
//TODO: Include SLAC
var Sbp = new Schema({
  msafn        : { type: Schema.Types.ObjectId, ref: 'Msa' },
  status       : String,
  sendmail     : Boolean,
  parameters   : [SbpParameters],
  summary      : [SbpSummary],
  trees        : [SbpTrees],
  slac_model   : [SlacModel],
  gard_splits  : [GardSplits],
  gard_summary : [GardSummary],
  gard_details : [GardDetails],
});

var SbpParameters = new Schema({
  ratematrix  : Mixed,  //Protein
  frequencies : Number, //Protein
  rateoption  : Number,
  rateclasses : Number,
  modelstring : String  //Non-protein
});

var SbpTrees = new Schema({
  _creator    : { type   : Schema.Types.ObjectId, ref : 'Sbp' },
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

var SbpSummary = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Sbp' },
  col_key   : String,
  col_value : String
});

module.exports = mongoose.model('Sbp', Sbp);
module.exports = mongoose.model('SbpParameters', SbpParameters);
module.exports = mongoose.model('SbpTrees', SbpTrees);
module.exports = mongoose.model('SbpSummary', SbpSummary);

