var mongoose = require('mongoose');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

var Msa = new Schema({
    contents    : {type: String, require: true},  
    uploadfn    : String,
    datatype    : Number,
    partitions  : Number,
    sites       : Number,
    rawsites    : Number,
    sequences   : Number,
    gencodeid   : Number,
    goodtree    : Number,
    nj          : String,
    mailaddr    : String,
    timestamp   : { type: String, default: (new Date()).getTime() }
});

Msa.index( { "id": 1 } );

var PartitionInfo = new Schema({
    _creator : { type: Schema.Types.ObjectId, ref: 'Msa' },
    partition   : Number,
    startCodon  : Number,
    endCodon    : Number,
    span        : Number,
    userTree    : String
});

var Sequences = new Schema({
    _creator : { type: Schema.Types.ObjectId, ref: 'Msa' },
    seqIndex : Number,
    name     : String
});

module.exports = mongoose.model('Msa', Msa);
