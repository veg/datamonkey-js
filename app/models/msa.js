/*

  Datamonkey - An API for comparative analysis of sequence alignments using state-of-the-art statistical models.

  Copyright (C) 2013
  Sergei L Kosakovsky Pond (spond@ucsd.edu)
  Steven Weaver (sweaver@ucsd.edu)

  Permission is hereby granted, free of charge, to any person obtaining a
  copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be included
  in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/


var mongoose = require('mongoose'),
    moment   = require('moment'),
    check    = require('validator').check,
    globals  = require( ROOT_PATH + '/config/globals.js'),
    sanitize = require('validator').sanitize

var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var Msa = new Schema({
    contents    : {type: String, require: true},
    datatype    : {type: Number, require: true},
    msaid       : {type: String, index: { unique: true, dropDups: true } },
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

var PartitionInfo = new Schema({
    _creator : { type: Schema.Types.ObjectId, ref: 'Msa' },
    partition   : Number,
    startcodon  : Number,
    endcodon    : Number,
    span        : Number,
    usertree    : String
});

var Sequences = new Schema({
    _creator : { type: Schema.Types.ObjectId, ref: 'Msa' },
    seqindex : Number,
    name     : String
});

Msa.virtual('clipped').get(function () {

  clipped_file = {
    gencodeid  : this.gencodeid,
    datatype   : this.datatype,
    msaid      : this.msaid,
    partitions : this.partitions,
    sites      : this.sites,
    rawsites   : this.rawsites,
    sequences  : this.sequences,
    goodtree   : this.goodtree,
    nj         : this.nj,
    timestamp  : this.timestamp,
    mailaddr   : this.mailaddr
  }

  return clipped_file;

});

Msa.virtual('genetic_code').get(function () {
    return globals.genetic_code[this.gencodeid];
});

Msa.virtual('day_created_on').get(function () {
    console.log(this.timestamp);
    var time = moment.unix(this.timestamp);
    console.log(time);
    return time.format('YYYY-MMM-DD');
});

Msa.virtual('time_created_on').get(function () {
    console.log(this.timestamp);
    var time = moment.unix(this.timestamp);
    console.log(time);
    return time.format('HH:mm');
});


var MsaModel = mongoose.model('MsaModel', Msa);

MsaModel.schema.path('mailaddr').validate(function (value) {
  if(value) {
  check(value).len(6, 64).isEmail();
  } else {
    return true;
  }
}, 'Invalid email');

Msa.methods.AnalysisCount = function (cb) {

  var type_counts = {};
  var c = 0;

  var count_increment = function(err, analysis) {

    c += 1;

    if(analysis != null) {
      type_counts[analysis.type] = analysis.id || 0; 
    }

    if(c == Object.keys(globals.types).length) {
      cb(type_counts);
    }

  }

  for(var t in globals.types) {
    Analysis = mongoose.model(t.capitalize());
    //Get count of this analysis
    Analysis 
    .findOne({ msaid: this.msaid })
    .sort('-id')
    .exec(count_increment)
  }

};

module.exports = mongoose.model('Msa', Msa);


