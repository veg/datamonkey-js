var global_err = "";

if (process.argv.length != 3) {
  global_err =
    "Expected a job ID command line argument in call to " + process.argv[1];
} else {
  require("../../models/hivtrace.js");

  var setup = require("../../../config/setup"),
    attributes = require("../../../config/attributes"),
    mongoose = require("mongoose"),
    _ = require("underscore"),
    id = process.argv[2],
    do_not_dc = false;

  mongoose.connect(setup.database);

  var HivTrace = mongoose.model("HivTrace");

  HivTrace.findOne({ _id: id }, function(err, hivtrace) {
    if (err || !hivtrace) {
      global_err = err;
    } else if (hivtrace.attributes && hivtrace.attributes.length) {
      process.exit(0);
    } else {
      publisher_push = _.throttle(function(perc) {
        process.stdout.write(perc + "\n");
      }, 200);

      var hivtrace_map = perform_the_mapping(hivtrace.headers, publisher_push);

      if (hivtrace_map.error && hivtrace_map.error.length) {
        global_err = hivtrace_map.error;
      } else {
        hivtrace.attributes = hivtrace_map.result.annotated_map;
        hivtrace.delimiter = hivtrace_map.result.delimiter;
        hivtrace.partitioned_headers = hivtrace_map.result.parsed_headers;
        do_not_dc = true;
        hivtrace.save(function() {
          process.exit(0);
          mongoose.disconnect();
        });
      }
    }

    if (!do_not_dc) {
      mongoose.disconnect();
    }

    if (global_err.length) {
      process.stderr.write(global_err + "\n");
      process.exit(1);
    }
  });
}

function perform_the_mapping(headers, publisher_push) {
  function isCountry(supposed_country) {
    return supposed_country in attributes.country.value
      ? [attributes.types.COUNTRY, supposed_country]
      : null;
  }

  var standardized_format = "YYYYMMDD";
  var subtype_dictionary = new Object();

  _.each(attributes.subtype.value, function(s) {
    subtype_dictionary[s] = true;
  });

  function isSubtype(supposed_subtype) {
    return supposed_subtype in subtype_dictionary
      ? [attributes.types.SUBTYPE, supposed_subtype]
      : null;
  }

  function isDate(supposed_date) {
    // check for sampling year/date
    /*var parsed_date = null;
        if (_.some(attributes.dates, function(d) {
                parsed_date = moment (supposed_date, d, 'en', true);
                if (parsed_date) {
                    return true;
                }
                parsed_date = null;
                return false;
            })) {
            return [attributes.types.DATE, parsed_date.format (standardized_format)];
        }*/
    var parsed_date = Date.parse(supposed_date);
    if (isNaN(parsed_date)) {
      return null;
    }
    parsed_date = new Date(parsed_date);
    return [
      attributes.types.DATE,
      "" +
        parsed_date.getFullYear() +
        "" +
        (1 + parsed_date.getMonth()) +
        "" +
        parsed_date.getDate()
    ];
  }

  var attr_validators = [
    isSubtype,
    isCountry,
    isDate,
    function(x) {
      return [attributes.types.UNKNOWN, x];
    }
  ];

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
          return [value, value.toUpperCase()].some(function(test_me) {
            var test = validator(test_me);
            if (test) {
              attr_map[cur_dl][index] = test;
              return true;
            }
            return false;
          });
        });
      });
    });

    return attr_map;
  };

  var all_maps = headers.map(function(header, index) {
    publisher_push(70 * (1 + index) / headers.length);
    return testForAttributes(header);
  });

  var binned_by_delimiter = attributes.delimiters.map(function(
    delimiter,
    index
  ) {
    var fields = [];

    publisher_push(70 + 10 * (1 + index) / attributes.delimiters.length);

    _.each(_.pluck(all_maps, delimiter), function(field_list) {
      for (var i = fields.length; i < field_list.length; i++) {
        var new_entry = new Object();
        new_entry[field_list[i][0]] = 0;
        fields.push(new_entry);
      }

      _.each(field_list, function(a_field, i) {
        fields[i][a_field[0]] = a_field[0] in fields[i]
          ? fields[i][a_field[0]] + 1
          : 1;
      });
    });
    return [delimiter, fields];
  });

  binned_by_delimiter.forEach(function(delimiter_record, index) {
    publisher_push(80 + 5 * (1 + index) / attributes.delimiters.length);
    delimiter_record.push(
      _.reduce(
        delimiter_record[1].map(function(mapping) {
          return _.reduce(
            mapping,
            function(memo, count, kind) {
              var value = kind != attributes.types.UNKNOWN &&
                kind != attributes.types.ID &&
                count * 2 >= all_maps.length
                ? count / all_maps.length
                : 0;
              return value > memo ? value : memo;
            },
            0
          );
        }),
        function(memo, d) {
          return memo - d * d;
        },
        0
      )
    );
  });

  var ranked_delimiters = _.sortBy(binned_by_delimiter, function(delimiter) {
    return delimiter[2];
  });

  var best_delimiter = ranked_delimiters[0][0],
    best_attr_map = ranked_delimiters[0][1];

  all_maps = _.pluck(all_maps, best_delimiter);

  var err = "", mapped_attributes = [], used_ids = {};

  best_attr_map.forEach(function(mapping, index) {
    publisher_push(85 + 5 * (1 + index) / best_attr_map.length);
    var label = attributes.types.UNKNOWN,
      label_prop = _.reduce(
        mapping,
        function(memo, count, kind) {
          var value = count / all_maps.length;
          if (value > memo) {
            label = kind;
            return value;
          }
          return memo;
        },
        0
      );

    var current_attribute = new Object();

    current_attribute.calculated = label;
    current_attribute.calculated_proportion = label_prop;
    if (label in used_ids) {
      current_attribute.annotation = label + "-" + ++used_ids[label];
    } else {
      current_attribute.annotation = label;
      used_ids[label] = 1;
    }

    mapped_attributes.push(current_attribute);
  });

  var id_tag = [-1, 0];

  mapped_attributes.forEach(function(ca, index) {
    publisher_push(90 + 10 * (1 + index) / mapped_attributes.length);
    var value_range = {}, mismatched = {};

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
        if (count > id_tag[1]) {
          id_tag[0] = index;
        }
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

  if (id_tag[0] >= 0) {
    mapped_attributes[id_tag[0]].calculated = attributes.types.ID;
  }

  /**
        categorize the individual attributes
        by estimating the range of values, and
        guessing what they represent.
    */

  return {
    error: err,
    result: {
      annotated_map: mapped_attributes,
      parsed_headers: all_maps,
      delimiter: best_delimiter
    }
  };
}
