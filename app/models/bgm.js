//Also needs to include status, and results
var mongoose = require('mongoose');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

var Bgm = new Schema({
    _creator : { type: Schema.Types.ObjectId, ref: 'Msa' },
});

module.exports = mongoose.model('Bgm', Bgm);
