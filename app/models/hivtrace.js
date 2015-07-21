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

var mongoose = require('mongoose'),
    check = require('validator').check,
    globals = require('../../config/globals.js'),
    seqio = require('../../lib/biohelpers/sequenceio.js'),
    sanitize = require('validator').sanitize,
    fs = require('fs'),
    readline = require('readline'),
    spawn = require('child_process').spawn,
    d3 = require('d3'),
    _ = require('underscore');

var ident = {
    SUBTYPE: "subtype",
    DATE: "date",
    ID: "id",
    COUNTRY: "country",
    UNKNOWN: "unknown"
}

var error_codes = {
    INCORRECT_SPLIT: 0,
    FAILED_ASSIGNMENT: 1
}

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

function notEmptyValidator(val) {
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
    reference: String,
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
        validate: [notEmptyValidator, 'Ambiguity Handling is empty']
    },
    attribute_map: Object,
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
    tn93_summary: String,
    tn93_results: String,
    lanl_tn93_results: String,
    error_message: String,
    created: {
        type: Date,
        default: Date.now
    }
});

/**
 * Validators to be passed to an html template as data attributes for 
 * form validation
 */
HivTrace.statics.validators = function() {
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
HivTrace.statics.lanl_validators = function() {
    var validators = [];
    validators.min_overlap = HivTrace.paths.lanl_min_overlap.options;
    validators.distance_threshold = HivTrace.paths.lanl_distance_threshold.options;
    return validators;
}


/**
 * Create an attribute map based off the header files of
 * a FASTA file
 */
HivTrace.statics.createAttributeMap = function(fn, cb) {
    // SDHC|AEH020|222-4kr|20090619
    // Z|JP|K03455|2036|6

    var subtype_dictionary = new Object,
        date_parser = attributes.dates.map(function(format) {
            return d3.time.format(format);
        });

    _.each(attributes.subtype.value, function(s) {
        subtype_dictionary[s] = true;
    });

    function isSubtype(supposed_subtype) {
        return supposed_subtype in subtype_dictionary ? attributes.types.SUBTYPE : null;
    }

    function isDate(supposed_date) {
        // check for sampling year/date
        if (_.some(date_parser, function(d) {
                return d.parse(supposed_date);
            })) {
            return attributes.types.DATE;
        }
        return null;

    }

    function isCountry(supposed_country) {
        return supposed_country in attributes.country.value ? attributes.types.COUNTRY : null;
    }

    var attr_validators = [isSubtype, isCountry, isDate, function(x) {
        return attributes.types.UNKNOWN;
    }];

    var testForAttributes = function(id) {
        /** split each sequence tag by all possible delimiters
            and return putative attribute maps for each one.
            For example 
            
            testForAttributes("050106508|06252003|pol|plasma|pool|1|ViroLogic|03_120785|NULL")
            
            returns 
            
            {
                _: ['id', 'unknown'],
                '|': ['id',
                    'date',
                    'unknown',
                    'unknown',
                    'unknown',
                    'unknown',
                    'unknown',
                    'unknown',
                    'unknown'
                ],
                '.': ['id'],
                ',': ['id'],
                ';': ['id'],
                '\t': ['id'],
                ':': ['id']
            }
            

        */

        var attr_map = {};
        attributes.delimiters.forEach(function(cur_dl) {
            attr_map[cur_dl] = [];
            id.split(cur_dl).forEach(function(value, index) {
                attr_validators.some(function(validator) {
                    var test = validator(value);
                    if (test) {
                        attr_map[cur_dl][index] = test;
                        return true;
                    }
                    return false;
                });
            });

            // We guess that the first unknown attribute is the ID
            var unknowns = attr_map[cur_dl].map(function(v, i) {
                return v == attributes.types.UNKNOWN ? i : -1;
            }).filter(function(v) {
                return v >= 0;
            });
            if (unknowns.length > 0) {
                attr_map[cur_dl][unknowns[0]] = attributes.types.ID;
            }
        });

        return attr_map;

    }

    var validateAttrMap = function(id, delimiter, attr_map) {
        /**
                
        */

        header = id.split(delimiter);

        for (var i = 0; i < attr_map.length; i++) {
            if (attr_map[i] == attributes.types.SUBTYPE) {
                if (!isSubtype(header[i])) {
                    attr_map[i] = 'maybe_' + attributes.types.SUBTYPE;
                    return false;
                }
                //Checking if a date is too expensive
            } else if (attr_map[i] == attributes.types.DATE) {
                if (!isDate(header[i])) {
                    attr_map[i] = 'maybe_' + attributes.types.DATE;
                    return false;
                }
            } else if (attr_map[i] == attributes.types.COUNTRY) {
                if (!isCountry(header[i])) {
                    attr_map[i] = 'maybe_' + attributes.types.COUNTRY;
                    return false;
                }
            }
        }
        return true;
    }

    var checkForConsistency = function(headers, delimiter, attr_map) {

        // Ensure all headers are the same same # of fields as attr_map
        var field_count = {};

        //Sort by file lengths
        headers.forEach(function(x) {
            field_count[x.split(delimiter).length] = field_count[x.split(delimiter).length] + 1 || 1
        });


        var lengths = _.keys(field_count),
            expected_count = _.keys(attr_map).length;


        if (lengths.length > 1 && _.sortBy(lengths, function(v) {
                return +v;
            })[0] < expected_count) {

            var failed_headers = headers.filter(function(x) {
                return x.split(delimiter).length < expected_count
            });
            return {
                'status': false,
                'info': {
                    'type': 'parse_fail',
                    'code': error_codes.INCORRECT_SPLIT,
                    'msg': 'Based on a delimiter of "' + delimiter + '", your file has inconsistent sequence name formatting. \
                    The following headers either have too few or too many fields. Please revise your FASTA file and resubmit \
                    once reconciled. Alternatively, you can skip attributes altogether and continue, but then you will not be able to\
                    perform attribute-based analyses.',
                    'failed_headers': failed_headers
                }
            };
        }


        // If more than one, return a problem with the problem headers
        //Change attribute map to maybe_ if some fail

        headers.forEach(function(x) {
            validateAttrMap(x, delimiter, attr_map)
        });
        return {
            'status': true
        }

    }

    fs.readFile(fn, function(err, data) {
        /** 
            1. read the file (raw)
            
            2. split into lines
            
            3. chop out FASTA headers
            
            4. for each header, compute a putative attribute map,
               (with testForAttributes), then
               select the best attribute map
               
               Best map is defined as having the most fields of types
               other than UNKNOWN, upon which more than 50% of the sequences
               agree. Ties are broken by the proportion of sequences that have 
               the same type of field in a given position, and by the order
               of appearance (left-to-right);
        
        */

        console.log("Starting header parsing");

        var err = false;

        if (err) {
            cb({
                'err': err
            }, false);
        }

        var data = data.toString();
        var lines = data.split(/(?:\n|\r\n|\r)/g);

        //Collect all headers
        var headers = lines.filter(function(x) {
                return x.indexOf('>') != -1;
            })
            .map(function(x) {
                return x.substring(x.indexOf('>') + 1)
            });


        var all_maps = headers.map(function(header) {
            return testForAttributes(header);
        });


        console.log("Done with testForAttributes");

        var binned_by_delimiter = attributes.delimiters.map(function(delimiter) {
            var fields = [];
            _.each(_.pluck(all_maps, delimiter), function(field_list) {

                for (var i = fields.length; i < field_list.length; i++) {
                    var new_entry = new Object;
                    new_entry[field_list[i]] = 0;
                    fields.push(new_entry);
                }

                _.each(field_list, function(a_field, i) {
                    fields[i][a_field] = (a_field in fields[i]) ? fields[i][a_field] + 1 : 1;
                });
            });
            return [delimiter, fields];
        });

        /*
            for each delimiter;
            
            1). Count how many 
        */
        
        _.each(binned_by_delimiter, function(pair) {
            console.log(pair[0]);
            _.each(pair[1], function(value, key) {
                console.log(key, value);
            });
        });

        

        console.log("Done with binned_by_delimiter");
        
        // select the best mapping
        
        
        
        

        var attr_map = testForAttributes(headers[0]), // Derive the attribute based on the first sequence
            best_delimiter = null, // Find the delimiter which yielded the most fields
            field_count = _.reduce(attr_map, function(memo, value, key) {
                if (value.length > memo) {
                    best_delimiter = key;
                    return value.length;
                }
                return memo;

            }, -1);

        var is_consistent = checkForConsistency(headers, best_delimiter, attr_map[best_delimiter]);
        if (!is_consistent.status) {
            err = is_consistent.info;
        }


        cb(err, {
            "headers": headers,
            /*_.map(all_maps, function (value, key) {
                return [key, value[best_delimiter]];
            }),*/
            "map": attr_map[best_delimiter],
            "delimiter": best_delimiter
        });

    });

}

HivTrace.statics.parseHeaderFromMap = function(header, attr_map) {
    parsed = {};
    var arr = header.split(attr_map.delimiter);
    for (var i in arr) {
        if (!parsed[attr_map.map[i]]) {
            parsed[attr_map.map[i]] = arr[i];
        } else {
            var c = 1;
            var new_key = attr_map.map[i] + c;

            while (parsed[new_key]) {
                new_key = attr_map.map[i] + ++c;
            }

            parsed[new_key] = arr[i];

        }
    }
    return parsed;
}


HivTrace.virtual('headers').get(function() {
    return seqio.parseFasta(fs.readFileSync(this.filepath).toString, true).map(function(e) {
        return e.name;
    });

    /*var data = data.toString();
    var lines = data.split(/(?:\n|\r\n|\r)/g);

    //Collect all headers
    var headers = lines.filter(function(x) { return x.indexOf('>') != -1 } );
    var headers = headers.map(function(x) { return x.substring(headers[0].indexOf('>') + 1) } );
    return headers;*/

});

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

/**
 * TODO: Change storage to mongodb instead of file
 */
HivTrace.virtual('trace_results').get(function() {
    return '/uploads/hivtrace/' + this._id + '_user.trace.json';
});

/**
 * TODO: Change storage to mongodb instead of file
 */
HivTrace.virtual('lanl_trace_results').get(function() {
    return '/uploads/hivtrace/' + this._id + '_lanl_user.trace.json';
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
HivTrace.virtual('status_index').get(function() {
    if (this.status != undefined) {
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


module.exports = mongoose.model('HivTrace', HivTrace);