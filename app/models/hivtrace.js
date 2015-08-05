/*

  Datamonkey - An API for comparative analysis of sequence alignments using state-of-the-art statistical models.

<<<<<<< HEAD
  Copyright (C) 2015
=======
  Copyright (C) 2014-2015
>>>>>>> master
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
    delimiter: String,
    data_id : Array,
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
    tn93_summary: String,
    tn93_results: String,
    lanl_tn93_results: String,
    error_message: String,
    combine_same_id_diff_dates: Array,
    stdout : String,
    stderr : String,
    results : Object

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
HivTrace.statics.createAttributeMap = function(instance, cb) {
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
                _: [
                    ['id', '050106508|06252003|pol|plasma|pool|1|ViroLogic|03'],
                    ['unknown', '120785|NULL']
                ],
                '|': [
                    ['id', '050106508'],
                    ['date', '06252003'],
                    ['unknown', 'pol'],
                    ['unknown', 'plasma'],
                    ['unknown', 'pool'],
                    ['unknown', '1'],
                    ['unknown', 'ViroLogic'],
                    ['unknown', '03_120785'],
                    ['unknown', 'NULL']
                ],
                '.': [
                    ['id',
                        '050106508|06252003|pol|plasma|pool|1|ViroLogic|03_120785|NULL'
                    ]
                ],
                ',': [
                    ['id',
                        '050106508|06252003|pol|plasma|pool|1|ViroLogic|03_120785|NULL'
                    ]
                ],
                ';': [
                    ['id',
                        '050106508|06252003|pol|plasma|pool|1|ViroLogic|03_120785|NULL'
                    ]
                ],
                '\t': [
                    ['id',
                        '050106508|06252003|pol|plasma|pool|1|ViroLogic|03_120785|NULL'
                    ]
                ],
                ':': [
                    ['id',
                        '050106508|06252003|pol|plasma|pool|1|ViroLogic|03_120785|NULL'
                    ]
                ]
            }


        */

        var attr_map = {};
        attributes.delimiters.forEach(function(cur_dl) {
            attr_map[cur_dl] = [];
            id.split(cur_dl).forEach(function(value, index) {
                attr_validators.some(function(validator) {
                    var test = validator(value);
                    if (test) {
                        attr_map[cur_dl][index] = [test, value];
                        return true;
                    } else {
                        var uc = value.toUpperCase();
                        if (validator (uc)) {
                            attr_map[cur_dl][index] = [test, uc];
                            return true;
                        }
                    }
                    return false;
                });
            });

            // We guess that the first unknown attribute is the ID
            var unknowns = attr_map[cur_dl].map(function(v, i) {
                return v[0] == attributes.types.UNKNOWN ? i : -1;
            }).filter(function(v) {
                return v >= 0;
            });
            if (unknowns.length > 0) {
                attr_map[cur_dl][unknowns[0]][0] = attributes.types.ID;
            }
        });

        return attr_map;

    }



    var all_maps = instance.headers.map(function(header) {
        return testForAttributes(header);
    });


    var binned_by_delimiter = attributes.delimiters.map(function(delimiter) {
        var fields = [];
        _.each(_.pluck(all_maps, delimiter), function(field_list) {

            for (var i = fields.length; i < field_list.length; i++) {
                var new_entry = new Object;
                new_entry[field_list[i][0]] = 0;
                fields.push(new_entry);
            }

            _.each(field_list, function(a_field, i) {
                fields[i][a_field[0]] = (a_field[0] in fields[i]) ? fields[i][a_field[0]] + 1 : 1;
            });
        });
        return [delimiter, fields];
    });

    var ranked_delimiters = _.sortBy(binned_by_delimiter, function(delimiter) {
        return _.reduce(delimiter[1].map(function(mapping) {
                return _.reduce(mapping, function(memo, count, kind) {
                    var value = (kind != attributes.types.UNKNOWN && kind != attributes.types.ID && count * 2 >= all_maps.length) ? count / all_maps.length : 0;
                    return value > memo ? value : memo;
                }, 0.)
            }),
            function(memo, d) {
                return memo - d * d;
            }, 0)
    });


    var best_delimiter = ranked_delimiters[0][0],
        best_attr_map = ranked_delimiters[0][1];

    all_maps = _.pluck(all_maps, best_delimiter);

    var err = '',
        mapped_attributes = [],
        used_ids = {};

    best_attr_map.forEach(function(mapping) {
        var label = attributes.types.UNKNOWN,
            label_prop = _.reduce(mapping, function(memo, count, kind) {
                var value = count / all_maps.length;
                if (value > memo) {
                    label = kind;
                    return value;
                }
                return memo;
            }, 0.);

        var current_attribute = new AttributeModel;

        current_attribute.calculated = label;
        current_attribute.calculated_proportion = label_prop;
        if (label in used_ids) {
            current_attribute.annotation = label + "-" + (++used_ids[label]);
        } else {
            current_attribute.annotation = label;
            used_ids[label] = 1;
        }


        mapped_attributes.push(current_attribute);

    });

 
    mapped_attributes.forEach(function(ca, index) {

        var value_range = {},
            mismatched = {};

        all_maps.forEach(function(mapping) {
            if (index < mapping.length) {
                attr = mapping[index];
                if (attr[0] == ca.calculated) {
                    if (attr[1] in value_range) {
                        value_range[attr[1]] += 1;
                    } else {
                        value_range[attr[1]] = 1;
                    }
                } else {
                    if (attr[1] in mismatched) {
                        mismatched[attr[1]] += 1;
                    } else {
                        mismatched[attr[1]] = 1;
                    }
                }
            }
        });

        var keys = _.keys(value_range);

        if (ca.calculated != attributes.types.DATE) {
            var count = keys.length;
            if (count * 5 < all_maps.length) {
                ca.category = "categorical";
            } else {
                ca.category = "individual";
            }
        } else {
            ca.category = "temporal";
        }


        ca.unique_values = keys.length;
        ca.value_examples = _.first(keys, 10);
        var mm = _.keys(mismatched);
        if (mm.length) {
            ca.failed_examples = _.first(mm, 10);
        }
        ca.failed_count = mm.length;
    });

    /**
        categorize the individual attributes
        by estimating the range of values, and
        guessing what they represent.
    */
    cb(err, {
        /*_.map(all_maps, function (value, key) {
            return [key, value[best_delimiter]];
        }),*/
        "annotated_map": mapped_attributes,
        "delimiter": best_delimiter
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
