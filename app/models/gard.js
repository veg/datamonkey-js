//Also needs to include status, and results
require(__dirname + '/slac');

var mongoose = require('mongoose')
  , SlacModel = mongoose.model('SlacModel');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

var Mixed = mongoose.Schema.Types.Mixed;

//TODO: status needs to be a subdocument
var Gard = new Schema({
  msafn      : { type: Schema.Types.ObjectId, ref: 'Msa' },
  status     : String,
  sendmail   : Boolean,
  parameters : [GardParameters],
  splits     : [GardSplits],
  details    : [GardDetails],
  summary    : [GardSummary],
  slac_model : [SlacModel],
});

var GardParameters = new Schema({
  ratematrix  : Mixed,  //Protein
  frequencies : Number, //Protein
  rateoption  : Number,
  rateclasses : Number,
  modelstring : String  //Non-protein
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
