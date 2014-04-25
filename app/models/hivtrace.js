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
    distance_threshold      : { type: Number, require: true, min : 0, max: 0.02, validate: [notEmptyValidator, 'Distance Threshold is empty'] },
    min_overlap             : { type: Number, require: true, min : 100, max: 1000, validate: [notEmptyValidator, 'Minimum Overlap is empty'] },
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
    trace_results           : String,
    lanl_trace_results      : String,
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
 * Ensure that the file is in valid FASTA format
 * The function relies on "FastaValidator" from 
 * git@github.com:veg/TN93.git to be installed and defined in setup
 * @param fn {String} path to file to be validated
 */
HivTrace.statics.validateFasta = function (fn, cb) {
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

function isSubtype(supposed_subtype) {
  return subtypes.subtypes.indexOf(supposed_subtype) != -1;
}

function isDate(supposed_date) {
  //// check for sampling year/date
  var valid_date_formats = [
                        "MM-DD-YYYY",
                        "DD-YY",
                        "DD-MM-YYYY",
                        "YYYY",
                        "YYYYMMDD"
                        ];

  var parsed_date = moment(supposed_date, valid_date_formats, true);

  if(parsed_date.isValid()) {
    return parsed_date.isBefore(moment());
  } else {
    return false;
  }
}

function isCountry(supposed_country) {
  return Object.keys(country_codes).indexOf(supposed_country) != -1
}

/**
 * Create an attribute map based off the header files of
 * a FASTA file
 */
HivTrace.statics.createAttributeMap = function (fn, cb) {
  // SDHC|AEH020|222-4kr|20090619
  // Z|JP|K03455|2036|6 

  var testForAttributes = function (id) {

    var attr_map = {};
    var possible_delimiters = ['_', '|','.',',',';','\t',':'];

    for(var i in possible_delimiters) {
      cur_dl = possible_delimiters[i];
      attr_map[cur_dl] = [];

      var arr = id.split(possible_delimiters[i]);

      for (var j in arr) {

        // Find subtype
        if (isSubtype(arr[j])) {
          attr_map[cur_dl][j] = ident.SUBTYPE;
        }

        // check if sampling country
        else if (isCountry(arr[j])) {
          attr_map[cur_dl][j] = ident.COUNTRY;
        }

        else if (isDate(arr[j])) {
          attr_map[cur_dl][j] = ident.DATE;
        }

        else {
          attr_map[cur_dl][j] = ident.UNKNOWN;
        }

      }

      // If there is only one null attribute, we can guess that it's the id
      var c = 0;
      var index = -1;
      for(var j = 0; j < attr_map[cur_dl].length; j++) {
        if(attr_map[cur_dl][j] == ident.UNKNOWN) {
          c++;
          index = j;
        }
      }
      if (c == 1) {
       attr_map[cur_dl][index] = "id";
      }
    }

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

    // Ensure all headers are the same length
    lengths = {};

    //Sort by file lengths
    headers.map( function(x) { lengths[x.split(delimiter).length] = lengths[x.split(delimiter).length] + 1 || 1});

    if(Object.keys(lengths).length > 1) {
      // Sort and return problematic headers
      var max   = 0;
      var index = 0;
      for(var j in lengths) {
        if(lengths[j] > max) {
          max = lengths[j]; 
          index = j;
        }
      }

      var failed_headers = headers.filter(function(x) { return x.split(delimiter).length != index} );
      return { 'status': false,
               'info'  : {
                 'type': 'parse_fail', 
                 'code': error_codes.INCORRECT_SPLIT, 
                 'msg': 'Based on a delimiter of "' + delimiter + '", you have inconsistent formatting. The following headers either have too little or too many fields. Please revise your FASTA file and resubmit once reconciled. Alternatively, you can skip attributes altogether and continue.', 
                 'failed_headers': failed_headers
                }
              };
    }


    // If more than one, return a problem with the problem headers
    //Change attribute map to maybe_ if some fail
    headers.map(function(x) { validateAttrMap(x, delimiter, attr_map) } );

    //var failed_headers = headers.filter(function(x) { return !validateAttrMap(x, delimiter, attr_map)} );
    //if(failed_headers.length > 0) {
    //  return { 'status': false,
    //           'info'  : {
    //             'type': 'parse_fail', 
    //             'code': error_codes.FAILED_ASSIGNMENT, 
    //             'msg': 'Some headers failed parsing', 
    //             'failed_headers': failed_headers
    //            }
    //          };
    //}

    return {'status': true}

  }


  // explode by all delimiting varieties
  fs.readFile(fn, function (err, data) {
    var err = false;

    if (err) {
      cb({'err': err}, false);
    }

    var data  = data.toString();
    var lines = data.split(/(?:\n|\r\n|\r)/g);

    //Collect all headers
    var headers = lines.filter(function(x) { return x.indexOf('>') != -1 } );
    var headers = headers.map(function(x) { return x.substring(headers[0].indexOf('>') + 1) } );

    // Try exploding and testing for attributes
    var attr_map = testForAttributes(headers[0]);

    // TODO: Check for a tie
    var max   = -4;
    var index = -4;
    for (c in attr_map) {
        if(attr_map[c].length > max) {
          max = attr_map[c].length;
          index = c;
        }
    }

    var is_consistent = checkForConsistency(headers, index, attr_map[index]);
    if(is_consistent.status != true) {
      err = is_consistent.info;
    }

    cb(err, {"headers": headers, "map" : attr_map[index], "delimiter": index});

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
  return setup.rootpath + setup.hivtrace_upload_path + this._id;
});

/**
 * Index of status
 */
HivTrace.virtual('status_index').get(function () {
  return this.status_stack.indexOf(this.status);
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

