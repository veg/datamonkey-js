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

var setup     = require( ROOT_PATH + '/config/setup'),
    hiv_setup = require( ROOT_PATH + '/config/hiv_cluster_globals');

var mongoose = require('mongoose'),
    moment   = require('moment'),
    check    = require('validator').check,
    globals  = require( ROOT_PATH + '/config/globals.js'),
    sanitize = require('validator').sanitize,
    spawn    = require('child_process').spawn;

var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

function notEmptyValidator (val) {
  return val != null;
}

/**
 * HivCluster Schema Type
 * distance threshold : Parameter set by user
 * min_overlap        : Parameter set by user
 * ambiguity_handling : Current status of job
 * status             : Current status of job
 * mailaddr           : User's email address
 * graph_dot          : Results
 * cluster_csv        : Results
 * created            : When the document was created
 */
var HivCluster = new Schema({
    distance_threshold : { type: Number, require: true, min : 0, max: 0.02, validate: [notEmptyValidator, 'Distance Threshold is empty'] },
    min_overlap        : { type: Number, require: true, min : 100, max: 1000, validate: [notEmptyValidator, 'Minimum Overlap is empty'] },
    ambiguity_handling : { type: String, require: true, validate: [notEmptyValidator, 'Ambiguity Handling is empty']},
    status             : { type: String, enum: hiv_setup.valid_statuses },
    mailaddr           : String,
    graph_dot          : String,
    cluster_csv        : String,
    created            : {type: Date, default: Date.now}
});


/**
 * Validators to be passed to an html template as data attributes for 
 * form validation
 */
HivCluster.statics.validators = function () {
  var validators = [];
  validators.min_overlap = HivCluster.paths.min_overlap.options;
  validators.distance_threshold = HivCluster.paths.distance_threshold.options;
  return validators;
}

/**
 * Ensure that the file is in valid FASTA format
 * The function relies on "FastaValidator" from 
 * git@github.com:veg/TN93.git to be installed and defined in setup
 * @param fn {String} path to file to be validated
 */
HivCluster.statics.validateFasta = function (fn, cb) {
  var fasta_validator =  spawn(setup.fasta_validator, 
                               [fn]); 

  fasta_validator.stderr.on('data', function (data) {
    // Failed return the error
    cb({success: false, msg: String(data).replace(/(\r\n|\n|\r)/gm,"")});
  }); 

  fasta_validator.on('close', function (code) {
    // Check the error code, but probably success!
    if(code != 1) {
      cb({success: true});
    }
  }); 
}

/**
 * Filename of document's file upload
 */
HivCluster.virtual('filename').get(function () {
  return this._id;
});

/**
 * Complete file path for document's file upload
 */
HivCluster.virtual('filepath').get(function () {
  return setup.root_hivcluster_path + this._id;
});


module.exports = mongoose.model('HivCluster', HivCluster);

