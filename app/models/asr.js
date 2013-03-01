//Also needs to include status, and results
var mongoose = require('mongoose');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

var Asr = new Schema({
    _creator : { type: Schema.Types.ObjectId, ref: 'MSA' },
    msafn      : { type: Schema.Types.ObjectId, ref: 'MSA' },
    status     : String,
    sendmail   : Boolean,
    parameters : [AsrParameters],
    residues   : [AsrResidues],
    marginal   : [AsrMarginalDump],
    sampled    : [AsrSampledDump],
    summary    : [AsrSummary]
});

var AsrParameters = new Schema({
    //TODO: Find this out
    _creator : { type: Schema.Types.ObjectId, ref: 'Asr' },
});

var AsrResidues = new Schema({
    _creator : { type: Schema.Types.ObjectId, ref: 'Asr' },
    partition : Number, 
    site : Number, 
    joint : String,
    marginal : String,
    sampled : String,
    marginalP : Number,
    sampledp : Number
});

var AsrMarginalDump = new Schema({
    _creator : { type: Schema.Types.ObjectId, ref: 'Asr' },
    partition : Number,
    sequence : Number,
    site : Number,
    a : Number,
    c : Number,
    g : Number,
    t : Number
});

var AsrSampledDump = new Schema({
    _creator : { type: Schema.Types.ObjectId, ref: 'Asr' },
    partition : Number,
    sequence : Number,
    site : Number,
    a : Number,
    c : Number,
    g : Number,
    t : Number
});

var AsrSummary = new Schema({
    _creator : { type: Schema.Types.ObjectId, ref: 'Asr' },
    col_key : String,
    col_value : String
});

module.exports = mongoose.model('Asr', Asr);
module.exports = mongoose.model('AsrResidues', AsrResidues);
module.exports = mongoose.model('AsrMarginalDump', AsrMarginalDump);,
module.exports = mongoose.model('AsrSampledDump', AsrSampledDump);,
module.exports = mongoose.model('AsrSummary', AsrSummary);

