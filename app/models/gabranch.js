//Also needs to include status, and results
var mongoose = require('mongoose');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

//TODO: status needs to be a subdocument
var GABranch = new Schema({
  msafn      : { type: Schema.Types.ObjectId, ref: 'MSA' },
  status     : String,
  sendmail   : Boolean,
  parameters : [GABranchParameters]
  summary    : [GABranchSummary]
});

var GABranchSummary = new Schema({
  _creator  : { type: Schema.Types.ObjectId, ref: 'Meme' },
  col_key   : String,
  col_value : String
});

module.exports = mongoose.model('GABranch', GABranch);
module.exports = mongoose.model('GABranchParameters', GABranchParameters);
module.exports = mongoose.model('GABranchSummary', GABranchSummary);

