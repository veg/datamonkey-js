//Also needs to include status, and results
var mongoose = require('mongoose');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

var Asr = new Schema({
    _creator : { type: Schema.Types.ObjectId, ref: 'SequenceFile' },
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

var AsrPartitionTables = new Schema({
    _creator : { type: Schema.Types.ObjectId, ref: 'Asr' },
    partition : Number,
    span : Number,
    tree : String,
    node_map : String
});

var AsrSummary = new Schema({
    _creator : { type: Schema.Types.ObjectId, ref: 'Asr' },
    col_key : String,
    col_value : String
});

module.exports = mongoose.model('Asr', Asr);
