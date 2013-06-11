var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

var Analysis = new Schema({
  msafn               : { type : Schema.Types.ObjectId, ref : 'Msa' },
  id                  : { type : Number },
  status              : String,
  sendmail            : Boolean,
});

module.exports = Analysis;
