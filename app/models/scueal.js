var mongoose = require('mongoose');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

//TODO: status needs to be a subdocument
//TODO: Include SLAC
var Scueal = new Schema({
  msafn             : { type : Schema.Types.ObjectId, ref : 'Msa' },
  status            : String,
  sendmail          : Boolean,
  parameters        : [ScuealParameters],
  subtyping_results : [ScuealSubtypingResults],
});

var ScuealParameters = new Schema({
  reference : String,
});

var ScuealSubtypingResults = new Schema({
  _creator          : { type: Schema.Types.ObjectId, ref: 'Scueal' },
  id                : String,
  file_index        : Number,
  result            : Number,
  subtype           : String,
  simplified        : String,
  support           : Number,
  rec_support       : Number,
  intra_rec_support : Number,
  breakpoints       : String,
  sequence          : String
});

module.exports = mongoose.model('Scueal', Scueal);
module.exports = mongoose.model('ScuealParameters', ScuealParameters);
module.exports = mongoose.model('ScuealSubtypingResults', ScuealSubtypingResults);

