/*

  Datamonkey - An API for comparative analysis of sequence alignments using state-of-the-art statistical models.

  Copyright (C) 2014-2015
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

var setup = require('../../config/setup'),
    attributes = require('../../config/attributes.json');

var mongoose  = require('mongoose'),
    moment    = require('moment'),
    d3        = require('d3'),
    check     = require('validator').check,
    globals   = require( '../../config/globals.js'),
    sanitize  = require('validator').sanitize,
    fs        = require('fs'),
    readline  = require('readline'),
    spawn     = require('child_process').spawn,
    _         = require ('underscore'),
    hpcsocket = require( __dirname + '/../../lib/hpcsocket.js'),
    winston   = require ('winston');

var ident = {
    SUBTYPE : "subtype",
    DATE    : "date",
    ID      : "id",
    COUNTRY : "country",
    UNKNOWN : "unknown"
};

var error_codes = {
    INCORRECT_SPLIT   : 0,
    FAILED_ASSIGNMENT : 1
};

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

function notEmptyValidator (val) {
  return val !== null;
}

/**
 * HivTrace Schema Type
 * distance threshold : Parameter set by user
 * min_overlap        : Parameter set by user
 * ambiguity_handling : Parameter set by user
 * status             : Current status of job
 * mailaddr           : User's email address
 * created            : When the document was created
 */
var SequenceAttribute = new Schema({
    calculated: {
        type: String,
        require: false,
        enum: _.map(attributes.types, function(value) {
            return value;
        })
    },
    calculated_proportion: Number,
    category: {
        type: String,
        require: true,
        enum: ["categorical", "individual", "temporal"]
    },
    annotation: {
        type: String,
        require: true
    },
    unique_values: Number,
    value_examples: Array,
    failed_examples: Array,
    failed_count: 0
});

var AttributeModel = mongoose.model('AttributeModel', SequenceAttribute);

var HivTrace = new Schema({
    reference: String,
    headers: Array,
    partitioned_headers: Array,
    delimiter: String,
    data_id: Array,
    attributes: [
        SequenceAttribute
    ],
    distance_threshold: {
        type: Number,
        require: true,
        min: 0,
        max: 0.02,
        default: .015,
        validate: [notEmptyValidator, 'Distance Threshold is empty']
    },
    min_overlap: {
        type: Number,
        require: true,
        min: 50,
        max: 5000,
        default: 500,
        validate: [notEmptyValidator, 'Minimum Overlap is empty']
    },
    fraction: {
        type: Number,
        require: true,
        min: 0,
        max: 1,
        default: .05
    },
    ambiguity_handling: {
        type: String,
        require: true,
        validate: [notEmptyValidator, 'Ambiguity Handling field is empty']
    },
    sequence_length: Number,
    status_stack: Array,
    status: {
        type: String
    },
    lanl_compare: Boolean,
    filter_edges: {
        type: String,
        enum: ['no', 'report', 'remove']
    },
    strip_drams: {
        type: String,
        enum: ['no', 'wheeler', 'lewis']
    },
    reference_strip: {
        type: String,
        enum: ['no', 'report', 'remove']
    },
    torque_id: String,
    custom_reference: String,
    mail: String,
    type : String,
    tn93_summary: String,
    tn93_results: String,
    lanl_tn93_results: String,
    error_message: String,
    combine_same_id_diff_dates: Array,
    stdout : String,
    stderr : String,
    results : Object,

    // if not empty, then combine the ID (index 0) with the date (index 1)
    created: {
        type: Date,
        default: Date.now
    }
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
};

/**
 * Validators to be passed to an html template as data attributes for
 * form validation
 */
HivTrace.statics.lanl_validators = function () {
  var validators = [];
  validators.min_overlap = HivTrace.paths.lanl_min_overlap.options;
  validators.distance_threshold = HivTrace.paths.lanl_distance_threshold.options;
  return validators;
};


/**
 * Create an attribute map based off the header files of
 * a FASTA file
 */

HivTrace.virtual('valid_statuses').get(function() {
    return ['In Queue', 'Aligning', 'BAM to FASTA conversion',
        'Computing pairwise TN93 distances', 'Inferring, filtering, and analyzing molecular transmission network', 'Completed'
    ];
});

HivTrace.virtual('valid_lanl_statuses').get(function() {
    return ['In Queue', 'Aligning', 'BAM to FASTA conversion',
        'Computing pairwise TN93 distances', 'Inferring, filtering, and analyzing molecular transmission network',
        'Computing pairwise TN93 distances against a public database',
        'Inferring connections to sequences in a public database', 'Completed'
    ];
});

HivTrace.virtual('off_kilter_statuses').get(function() {
    return ['In Queue', 'Aligning', 'BAM to FASTA conversion',
        'Computing pairwise TN93 distances', 'Inferring, filtering, and analyzing molecular transmission network',
        'Computing pairwise TN93 distances against a public database',
        'Inferring connections to sequences in a public database', 'Completed'
    ];
});

/**
 * Filename of document's file upload
 */
HivTrace.virtual('filename').get(function() {
    return this._id;
});

/**
 * Complete file path for document's file upload
 */
HivTrace.virtual('filepath').get(function() {
    return __dirname + "/../../uploads/hivtrace/" + this._id;
});

HivTrace.virtual('analysistype').get(function() {
  return 'hivtrace';
});

/**
* file path for aligned document
*/
HivTrace.virtual('aligned_fasta_fn').get(function () {
  return __dirname + "/../../uploads/hivtrace/" + this._id + '.aligned.fa';
});

/**
* relative file path for aligned document
*/
HivTrace.virtual('rel_aligned_fasta_fn').get(function () {
  return this._id + '.aligned.fa';
});

/**
 * TODO: Change storage to mongodb instead of file
 */
HivTrace.virtual('input_sequences').get(function() {
    return '/uploads/hivtrace/' + this._id;
});


/**
 * Index of status
 */
HivTrace.virtual('status_index').get(function () {
  if(this.status !== undefined) {
    return this.status_stack.indexOf(this.status);
  } else {
    return -1;
  }
});

/**
 * Percentage of job complete
 */
HivTrace.virtual('percentage_complete').get(function() {
    return ((this.status_index + 1) / this.status_stack.length) * 100 + '%';
});

/**
 * Unix timestamp
 */
HivTrace.virtual('timestamp').get(function() {
    return moment(this.created).unix();
});

/**
 * URL
 */
HivTrace.virtual('url').get(function() {
    return 'http://' + setup.host + '/hivtrace/' + this._id;
});

HivTrace.statics.submitJob = function (result, cb) {

  winston.info('submitting ' + result.analysistype + ' : ' + result._id + ' to cluster');
  var jobproxy = new hpcsocket.HPCSocket({'filepath'    : result.filepath, 
                                          'msa'         : result.msa,
                                          'analysis'    : result,
                                          'status_stack': result.status_stack,
                                          'type'        : result.analysistype}, 'spawn', cb);

};

module.exports = mongoose.model('HivTrace', HivTrace);
