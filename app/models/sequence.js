var mongoose = require('mongoose');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

// create Widget model
var Sequence = new Schema({
  seq : {type: String, require: true},
  name: String,
  datatype : Number,
  gencode : Number,
  sequences : Number,
  sites : Number,
  partitions : Number
});

module.exports = mongoose.model('Sequence', Sequence);
