//Also needs to include status, and results
var mongoose = require('mongoose');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

// create Widget model
var Analysis = new Schema({
  seqid : {type: String, require: true, trim: true, unique: true},
  method : Number,
  treemode : Number,
  root : String,
  modelstring: String,
  roptions: Number,
  dnds: Number,
  ambchoice: Number,
  pvalue: Number,
  rateoption: Number,
  rateclasses: Number,
  rateoption2: Number,
  rateclasses2: Number,
});

module.exports = mongoose.model('Analysis', Analysis);
