//Also needs to include status, and results
var mongoose = require('mongoose');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

//TODO: status needs to be a subdocument
var Meme = new Schema({
  msafn      : { type: Schema.Types.ObjectId, ref: 'Msa' },
  status     : String,
  sendmail   : Boolean,
  parameters : [MemeParameters],
  results    : [MemeResults],
  mappings   : [MemeMappings],
  summary    : [MemeSummary]
});

var MemeParameters = new Schema({
  modelstring : String,
  treemode    : Number,
  pvalue      : Number,
});

var MemeResults = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Meme' },
  codon   : Number,
  beta1   : Number,
  p1      : Number,
  beta2   : Number,
  p2      : Number,
  alpha   : Number,
  lrt     : Number,
  pvalue  : Number,
  logl    : Number,
  qvalue  : Number
});

var MemeMappings = new Schema({
  _creator : { type: Schema.Types.ObjectId, ref: 'Meme' },
  tree     : Number,
  codon    : Number,
  branch   : String,
  pp       : Number,
  ebf      : Number,
  syn      : Number,
  nonsyn   : Number
});

var MemeSummary = new Schema({
  _creator  : { type: Schema.Types.ObjectId, ref: 'Meme' },
  col_key   : String,
  col_value : String
});

module.exports = mongoose.model('Meme', Meme);
module.exports = mongoose.model('MemeParameters', MemeParameters);
module.exports = mongoose.model('MemeResults', MemeResults);
module.exports = mongoose.model('MemeMappings', MemeMappings);
module.exports = mongoose.model('MemeSummary', MemeSummary);
