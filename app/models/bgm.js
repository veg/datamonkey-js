//Also needs to include status, and results
var mongoose = require('mongoose');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

var Bgm = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Msa' },
});

var BgmParameters = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Asr' },
  roptions   : Number,
  pvalue     : Number,
  dnds       : Number,
  ambchoice  : Number
});

module.exports = mongoose.model('Bgm', Bgm);
