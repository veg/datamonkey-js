var mongoose = require('mongoose'),
  extend = require('mongoose-schema-extend');

var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var AnalysisSchema = new Schema({
  msafn               : { type : Schema.Types.ObjectId, ref : 'Msa' },
  id                  : { type : Number },
  msaid               : String,
  type                : String,
  status              : String,
  sendmail            : Boolean,
  timestamp           : { type: String, default: (new Date()).getTime() }
});

module.exports = AnalysisSchema;
