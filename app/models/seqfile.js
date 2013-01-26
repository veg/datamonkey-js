var mongoose = require('mongoose');

var Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

var SequenceAlignmentFile = new Schema({
    contents    : {type: String, require: true},  
    uploadfn    : String,
    datatype    : Number,
    partitions  : Number,
    sites       : Number,
    rawSites    : Number,
    sequences   : Number,
    genCodeId   : Number,
    goodTree    : Number,
    nj          : String,
    timestamp   : { type: String, default: (new Date()).getTime() }
});

SequenceAlignmentFile.index( { "id": 1 } );

var PartitionInfo = new Schema({
    _creator : { type: Schema.Types.ObjectId, ref: 'SequenceAlignmentFile' },
    partition : Number,
    startCodon : Number,
    endCodon : Number,
    span : Number,
    userTree : String
});

var Sequences = new Schema({
    _creator : { type: Schema.Types.ObjectId, ref: 'SequenceAlignmentFile' },
    seqIndex : Number,
    name : String
});

module.exports = mongoose.model('SequenceAlignmentFile', SequenceAlignmentFile);
