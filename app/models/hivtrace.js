/*

  Datamonkey - An API for comparative analysis of sequence alignments using state-of-the-art statistical models.

  Copyright (C) 2014
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
    country_codes = require( '../../config/country_codes.json'),
    subtypes      = require( '../../config/subtypes.json');

var mongoose = require('mongoose'),
    moment   = require('moment'),
    check    = require('validator').check,
    globals  = require( '../../config/globals.js'),
    sanitize = require('validator').sanitize,
    fs       = require('fs'),
    readline = require('readline'),
    spawn    = require('child_process').spawn,
    _        = require ('underscore');

var ident = {
    SUBTYPE : "subtype",
    DATE    : "date",
    ID      : "id",
    COUNTRY : "country",
    UNKNOWN : "unknown"
}

var error_codes = {
    INCORRECT_SPLIT   : 0,
    FAILED_ASSIGNMENT : 1
}

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
    distance_threshold      : { type: Number, require: true, min : 0, max: 0.02, default: .015, validate: [notEmptyValidator, 'Distance Threshold is empty'] },
    min_overlap             : { type: Number, require: true, min : 50, max: 5000, default: 500, validate: [notEmptyValidator, 'Minimum Overlap is empty'] },
    fraction                : { type: Number, require: true, min : 0, max: 1, default: .05 },
    ambiguity_handling      : { type: String, require: true, validate: [notEmptyValidator, 'Ambiguity Handling is empty']},
    attribute_map           : Object,
    sequence_length         : Number,
    status_stack            : Array,
    status                  : { type: String },
    lanl_compare            : Boolean,
    filter_edges            : { type: String, enum: ['no','report','remove']},
    strip_drams             : { type: String, enum: ['no','wheeler','lewis']},
    reference_strip         : { type: String, enum: ['no','report','remove']},
    torque_id               : String,
    custom_reference        : String,
    mail                    : String,
    tn93_summary            : String,
    tn93_results            : String,
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

function isSubtype(supposed_subtype) {
  return subtypes.subtypes.indexOf(supposed_subtype) != -1 ? ident.SUBTYPE : null;
}

function isDate(supposed_date) {
  // check for sampling year/date
  var valid_date_formats = [
                        "MM-DD-YYYY",
                        "DD-YY",
                        "DD-MM-YYYY",
                        "YYYY",
                        "YYYYMMDD"
                        ];

  var parsed_date = moment(supposed_date, valid_date_formats, true);

  if(parsed_date.isValid()) {
    return ident.DATE;
  } else {
    return null;
  }

}

function isCountry(supposed_country) {
  return Object.keys(country_codes).indexOf(supposed_country) != -1 ? ident.COUNTRY : null;
}

/**
* Create an attribute map based off the header files of
* a FASTA file
*/
HivTrace.statics.createAttributeMap = function (fn, cb) {
  // SDHC|AEH020|222-4kr|20090619
  // Z|JP|K03455|2036|6
  
  var attr_validators = [isSubtype, isCountry, isDate, function (x) { return ident.UNKNOWN; }];

  var testForAttributes = function (id) {

    var attr_map = {};
    ['_', '|','.',',',';','\t',':'].forEach (function (cur_dl) {
          attr_map[cur_dl] = [];
          id.split(cur_dl).forEach (function (value, index) {
                attr_validators.some (function (validator) {
                    var test = validator (value);
                    if (test) {
                        attr_map[cur_dl][index] = test;
                        return true;
                    }
                    return false;
                });
            });
 
      // If there is only one null attribute, we can guess that it's the id
      var unknowns = attr_map[cur_dl].map (function (v,i) {return v ==  ident.UNKNOWN ? i : -1;}).filter (function (v) { return v>=0;});
      if (unknowns.length == 1) {
        attr_map [cur_dl][unknowns[0]] = "id";
      }
    });
    
    return attr_map;

  }

  var validateAttrMap = function (id, delimiter, attr_map) {

    header = id.split(delimiter);

    for(var i=0; i < attr_map.length; i++) {
      if(attr_map[i] == ident.SUBTYPE) {
        if (!isSubtype(header[i])) {
          attr_map[i] = 'maybe_' + ident.SUBTYPE;
          return false;
        }
      //Checking if a date is too expensive
      } else if (attr_map[i] == ident.DATE) {
        if (!isDate(header[i])) {
          attr_map[i] = 'maybe_' + ident.DATE;
          return false;
        }
      } else if (attr_map[i] == ident.COUNTRY) {
        if (!isCountry(header[i])) {
          attr_map[i] = 'maybe_' + ident.COUNTRY;
          return false;
        }
      }
    }
    return true;
  }

  var checkForConsistency = function (headers, delimiter, attr_map) {

    // Ensure all headers are the same same # of fields as attr_map
    var field_count = {};

    //Sort by file lengths
    headers.forEach( function(x) { field_count[x.split(delimiter).length] = field_count[x.split(delimiter).length] + 1 || 1});
    
    
    var lengths = _.keys (field_count),
        expected_count = _.keys (attr_map).length;
    

    if(lengths.length > 1 && _.sortBy (lengths, function (v) {return +v;}) [0] < expected_count) {
          
      var failed_headers = headers.filter(function(x) { return x.split(delimiter).length < expected_count} );
      return { 'status': false,
               'info' : {
                 'type': 'parse_fail',
                 'code': error_codes.INCORRECT_SPLIT,
                 'msg': 'Based on a delimiter of "' + delimiter + '", you have inconsistent formatting. The following headers either have too few or too many fields. Please revise your FASTA file and resubmit once reconciled. Alternatively, you can skip attributes altogether and continue.',
                 'failed_headers': failed_headers
                }
              };
    }


    // If more than one, return a problem with the problem headers
    //Change attribute map to maybe_ if some fail

    headers.forEach(function(x) { validateAttrMap(x, delimiter, attr_map) } );
    return {'status': true}

  }

  // explode by all delimiting varieties
  fs.readFile(fn, function (err, data) {
    var err = false;

    if (err) {
      cb({'err': err}, false);
    }

    var data = data.toString();
    var lines = data.split(/(?:\n|\r\n|\r)/g);

    //Collect all headers
    var headers = lines.filter(function(x) { return x.indexOf('>') != -1; } )
                       .map (function(x) { return x.substring(x.indexOf('>') + 1) } );

    // Derive the attribute based on the first sequence
    var attr_map = testForAttributes(headers[0]);

    // Find the delimiter which yielded the most fields
    var best_delimiter = null;
    
    var field_count = _.reduce (attr_map, function (memo, value, key) {
        if (value.length > memo) {
            best_delimiter = key;
            return value.length;
        }
        return memo;
        
    }, -1);
    
    var is_consistent = checkForConsistency(headers, best_delimiter, attr_map[best_delimiter]);
    if(! is_consistent.status) {
      err = is_consistent.info;
    }

    cb(err, {"headers": headers, "map" : attr_map[best_delimiter], "delimiter": best_delimiter});

  });

}

HivTrace.statics.parseHeaderFromMap = function (header, attr_map) {
  parsed = {};
  var arr = header.split(attr_map.delimiter);
  for(var i in arr) {
    if(!parsed[attr_map.map[i]]) {
      parsed[attr_map.map[i]] = arr[i];
    } else {
      var c = 1;
      var new_key = attr_map.map[i] + c;

      while(parsed[new_key]) {
        new_key = attr_map.map[i] + ++c;
      }

      parsed[new_key] = arr[i];

    }
  }
  return parsed;
}


HivTrace.virtual('headers').get(function () {

  var data = fs.readFileSync(this.filepath);
  var data = data.toString();
  var lines = data.split(/(?:\n|\r\n|\r)/g);

  //Collect all headers
  var headers = lines.filter(function(x) { return x.indexOf('>') != -1 } );
  var headers = headers.map(function(x) { return x.substring(headers[0].indexOf('>') + 1) } );
  return headers;

});

HivTrace.virtual('valid_statuses').get(function () {
  return  ['In Queue', 'Aligning', 'BAM to FASTA conversion', 
           'Computing pairwise TN93 distances', 'Inferring, filtering, and analyzing molecular transmission network', 'Completed'];
});

HivTrace.virtual('valid_lanl_statuses').get(function () {
  return ['In Queue', 'Aligning', 'BAM to FASTA conversion', 
          'Computing pairwise TN93 distances', 'Inferring, filtering, and analyzing molecular transmission network',
          'Computing pairwise TN93 distances against a public database', 
          'Inferring connections to sequences in a public database', 'Completed'];
});

HivTrace.virtual('off_kilter_statuses').get(function () {
  return ['In Queue', 'Aligning', 'BAM to FASTA conversion', 
          'Computing pairwise TN93 distances', 'Inferring, filtering, and analyzing molecular transmission network', 
          'Computing pairwise TN93 distances against a public database', 
          'Inferring connections to sequences in a public database', 'Completed'];
});

/**
 * Filename of document's file upload
 */
HivTrace.virtual('filename').get(function () {
  return this._id;
});

/**
* Complete file path for document's file upload
*/
HivTrace.virtual('filepath').get(function () {
  return __dirname + "/../../uploads/hivtrace/" + this._id;
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
 * TODO: Change storage to mongodb instead of file
 */
HivTrace.virtual('input_sequences').get(function () {
  return '/uploads/hivtrace/' + this._id;
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

