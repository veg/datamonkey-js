/*

  Datamonkey - An API for comparative analysis of sequence alignments using state-of-the-art statistical models.

  Copyright (C) 2015
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


var mongoose  = require('mongoose'),
    globals   = require( '../../config/globals.js'),
    moment    = require('moment'),
    _         = require('underscore'),
    winston   = require('winston'),
    hpcsocket = require( __dirname + '/../../lib/hpcsocket.js'),
    Msa       = require(__dirname + '/msa'),
    extend    = require('mongoose-schema-extend');


var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var AnalysisSchema = new Schema({
  msa                 : [Msa.MsaSchema],
  treemode            : Number,
  created             : {type: Date, default: Date.now},
  id                  : {type: Number, require: true},
  type                : {type: String, require: true},
  status              : String,
  last_status_msg     : Object,
  torque_id           : String,
  sendmail            : Boolean,
  mail                : String,
  error_message       : String,
  cpu_time            : Number
});

AnalysisSchema.virtual('since_created').get(function () {
    moment.lang('en');
    var time = moment(this.timestamp);
    return time.fromNow();
});

/**
 * Filename of document's file upload
 */
AnalysisSchema.virtual('valid_statuses').get(function () {
  return ['queue', 
          'running',
          'completed'];
});

AnalysisSchema.statics.pendingJobs = function (cb) {
  this.find({ $or: [ { "status": "queue" }, 
                     { "status": "running"} ] })
                        .populate('upload_id')
                        .exec(function(err, items) {
                          cb(err, items);
                         });
};

AnalysisSchema.statics.submitJob = function (result, cb) {

  winston.info('submitting ' + result.analysistype + ' : ' + result._id + ' to cluster');
  var jobproxy = new hpcsocket.HPCSocket({'filepath'    : result.filepath, 
                                          'msa'         : result.msa,
                                          'analysis'    : result,
                                          'status_stack': result.status_stack,
                                          'type'        : result.analysistype}, 'spawn', cb);

};



AnalysisSchema.statics.subscribePendingJobs = function () {
  this.pendingJobs(function(err, items) {
    _.each(items, function(item) { 
      item.resubscribe();
    });
  });
};

AnalysisSchema.statics.usageStatistics = function (cb) {

  // Aggregation is done client-side
  this.find({}, 'cpu_time created upload_id pvalue modelstring')
        .limit(1000)
        .populate('upload_id', 'sequences sites')        
        .exec( function(err, items) {
              cb(err, items);
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

  return this.status_stack.map(function(d) {
    return d.toLowerCase();
  }).indexOf(this.status);

});

AnalysisSchema.methods.resubscribe = function () {

  var jobproxy = new hpcsocket.HPCSocket({'filepath'    : this.filepath, 
                                          'msa'         : this.msa,
                                          'analysis'    : this,
                                          'status_stack': this.status_stack,
                                          'type'        : this.analysistype}, 'resubscribe');

}


module.exports = AnalysisSchema;
