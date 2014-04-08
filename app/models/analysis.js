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
    globals  = require( '../../config/globals.js'),
    moment   = require('moment'),
    extend   = require('mongoose-schema-extend');


var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var AnalysisSchema = new Schema({
  upload_id           : {type: Schema.Types.ObjectId, require: true, ref: 'Msa'},
  created             : {type: Date, default: Date.now},
  id                  : {type: Number, require: true},
  type                : {type: String, require: true},
  status              : String,
  torque_id           : String,
  sendmail            : Boolean,
  cpu_time            : Number
});

AnalysisSchema.virtual('since_created').get(function () {
    moment.lang('en');
    var time = moment(this.timestamp);
    return time.fromNow();
});


AnalysisSchema.statics.jobs = function (cb) {
  this.find({ $or: [ { "status": globals.running }, 
                     { "status": globals.queue} ] })
                        .populate('upload_id')
                        .exec(function(err, items) {
                          cb(err, items)
                         });
};

AnalysisSchema.statics.usageStatistics = function (cb) {

  // Aggregation is done client-side
  this.find({}, 'cpu_time created upload_id pvalue modelstring')
        .limit(1000)
        .populate('upload_id', 'sequences sites')        
        .exec( function(err, items) {
              cb(err, items)
             });

};

/**
 * Unix timestamp
 */
AnalysisSchema.virtual('timestamp').get(function () {
  return moment(this.created).unix();
});

/**
 * Index of status
 */
AnalysisSchema.virtual('status_index').get(function () {
  return this.status_stack.indexOf(this.status);
});


module.exports = AnalysisSchema;
