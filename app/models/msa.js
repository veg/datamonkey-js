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
    globals  = require('../../config/globals.js'),
    spawn    = require('child_process').spawn,
    sanitize = require('validator').sanitize

var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var Msa = new Schema({
    datatype       : {type : Number, require : true},
    partition_info : [PartitionInfo],
    sequence_info  : [Sequences],
    partitions     : Number,
    sites          : Number,
    rawsites       : Number,
    sequences      : Number,
    gencodeid      : Number,
    goodtree       : Number,
    nj             : String,
    mailaddr       : String,
    created        : {type : Date, default : Date.now}
});

var PartitionInfo = new Schema({
    _creator   : { type : Schema.Types.ObjectId, ref : 'Msa' },
    partition  : Number,
    startcodon : Number,
    endcodon   : Number,
    span       : Number,
    usertree   : String
});

var Sequences = new Schema({
    _creator : { type : Schema.Types.ObjectId, ref : 'Msa' },
    seqindex : Number,
    name     : String
});

Msa.virtual('genetic_code').get(function () {
    return globals.genetic_code[this.gencodeid];
});

Msa.virtual('day_created_on').get(function () {
    var time = moment(this.timestamp);
    return time.format('YYYY-MMM-DD');
});

Msa.virtual('time_created_on').get(function () {
    var time = moment(this.timestamp);
    return time.format('HH:mm');
});

/**
 * Filename of document's file upload
 */
Msa.virtual('filename').get(function () {
  return this._id;
});

/**
 * Complete file path for document's file upload
 */
Msa.virtual('filepath').get(function () {
  return __dirname + '../../uploads/msa/' + this._id;
});

Msa.virtual('hyphy_friendly').get(function () {

  //Hyphy does not support arrays
  var hyphy_obj = {};
  var self = this;

  Object.keys(this._doc).forEach(function(key) {
    if(Array.isArray(self[key])) {
        hyphy_obj[key] = {};
     for(var i = 0; i < self[key].length; i++) {
        hyphy_obj[key][i] = self[key][i];
     }
    } else {
      if(key != "created") {
        hyphy_obj[key] = self[key];
      }
    }
  });

  return hyphy_obj;

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

  //TODO: Change to get children
  for(var t in globals.types) {

    Analysis = mongoose.model(t.capitalize());
    //Get count of this analysis
    Analysis 
    .findOne({ upload_id: this._id })
    .sort('-id')
    .exec(count_increment)
  }

};

Msa.methods.dataReader = function (file, cb) {

  var hyphy =  spawn(setup.hyphy,
                    [__dirname + "../../lib/bfs/datareader.bf"]);

  hyphy.stdout.on('data', function (data) {
    var results;
    try {
      results = JSON.parse(data);
    } catch(e) {
      results = {'error': "An unexpected error occured when parsing the sequence alignment! Here is the full traceback :" + data }
    }
    cb(results);
  });

  hyphy.stdin.write(file + "\n");
  hyphy.stdin.write(this.gencodeid.toString());
  hyphy.stdin.end();

};


module.exports = mongoose.model('Msa', Msa);
module.exports = mongoose.model('PartitionInfo', PartitionInfo);
module.exports = mongoose.model('Sequences', Sequences);
