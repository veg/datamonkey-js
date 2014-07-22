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

var setup         = require( '../../config/setup'),
    hiv_setup     = require( '../../config/hivtrace_globals'),
    country_codes = require( '../../config/country_codes.json'),
    subtypes      = require( '../../config/subtypes.json');

var mongoose = require('mongoose'),
    moment   = require('moment'),
    check    = require('validator').check,
    globals  = require( '../../config/globals.js'),
    sanitize = require('validator').sanitize,
    fs       = require('fs'),
    readline = require('readline'),
    spawn    = require('child_process').spawn;

var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

function notEmptyValidator (val) {
  return val != null;
}

/**
 * HivTrace Schema Type
 * distance threshold : Parameter set by user
 * min_overlap        : Parameter set by user
 * ambiguity_handling : Current status of job
 * status             : Current status of job
 * mailaddr           : User's email address
 * graph_dot          : Results
 * cluster_csv        : Results
 * created            : When the document was created
 */
var HivTrace = new Schema({
    reference               : String,
    distance_threshold      : { type: Number, require: true, min : 0, max: 0.02, validate: [notEmptyValidator, 'Distance Threshold is empty'] },
    min_overlap             : { type: Number, require: true, min : 100, max: 1000, validate: [notEmptyValidator, 'Minimum Overlap is empty'] },
    fraction                : { type: Number, require: true, min : 0, max: 1 },
    ambiguity_handling      : { type: String, require: true, validate: [notEmptyValidator, 'Ambiguity Handling is empty']},
    attribute_map           : Object,
    sequence_length         : Number,
    status_stack            : Array,
    status                  : { type: String },
    lanl_compare            : Boolean,
    torque_id               : String,
    mail                    : String,
    tn93_summary            : String,
    tn93_results            : String,
    //trace_results           : String,
    //lanl_trace_results      : String,
    lanl_tn93_results       : String,
    error_message           : String,
    created                 : {type: Date, default: Date.now}
});

/**
 * Validators to be passed to an html template as data attributes for 
 * form validation
 */
HivTrace.statics.validators = function () {
  var validators = [];
  validators.min_overlap = HivTrace.paths.min_overlap.options;
  validators.distance_threshold = HivTrace.paths.distance_threshold.options;
  validators.fraction = HivTrace.paths.fraction.options;
  return validators;
}

/**
 * Validators to be passed to an html template as data attributes for 
 * form validation
 */
HivTrace.statics.lanl_validators = function () {
  var validators = [];
  validators.min_overlap = HivTrace.paths.lanl_min_overlap.options;
  validators.distance_threshold = HivTrace.paths.lanl_distance_threshold.options;
  return validators;
}

/**
 * Filename of document's file upload
 */
HivTrace.virtual('filename').get(function () {
  return this._id;
});

/**
 * TODO: Change storage to mongodb instead of file
 */
HivTrace.virtual('trace_results').get(function () {
  return '/uploads/hivtrace/' + this._id + '_user.trace.json';
});

/**
 * TODO: Change storage to mongodb instead of file
 */
HivTrace.virtual('lanl_trace_results').get(function () {
  return '/uploads/hivtrace/' + this._id + '_lanl_user.trace.json';
});

/**
 * Index of status
 */
HivTrace.virtual('status_index').get(function () {
  if(this.status != undefined) {
    return this.status_stack.indexOf(this.status);
  } else {
    return -1;
  }
});

/**
 * Percentage of job complete
 */
HivTrace.virtual('percentage_complete').get(function () {
  return ((this.status_index + 1)/this.status_stack.length)*100 + '%';
});

/**
 * Unix timestamp
 */
HivTrace.virtual('timestamp').get(function () {
  return moment(this.created).unix();
});

/**
 * URL 
 */
HivTrace.virtual('url').get(function () {
  return 'http://' + setup.host + '/hivtrace/' + this._id;
});


module.exports = mongoose.model('HivTrace', HivTrace);

