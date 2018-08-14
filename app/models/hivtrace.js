var setup = require("../../config/setup"),
  attributes = require("../../config/attributes.json");
path = require("path");

var mongoose = require("mongoose"),
  moment = require("moment"),
  d3 = require("d3"),
  check = require("validator").check,
  globals = require("../../config/globals.js"),
  sanitize = require("validator").sanitize,
  fs = require("fs"),
  readline = require("readline"),
  spawn = require("child_process").spawn,
  _ = require("underscore"),
  hpcsocket = require(path.join(__dirname, "/../../lib/hpcsocket.js")),
  mailer = require(path.join(__dirname, "/../../lib/mailer.js")),
  winston = require("winston");

var ident = {
  SUBTYPE: "subtype",
  DATE: "date",
  ID: "id",
  COUNTRY: "country",
  UNKNOWN: "unknown"
};

var error_codes = {
  INCORRECT_SPLIT: 0,
  FAILED_ASSIGNMENT: 1
};

var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

function notEmptyValidator(val) {
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

var AttributeModel = mongoose.model("AttributeModel", SequenceAttribute);

var HivTrace = new Schema({
  reference: String,
  headers: Array,
  partitioned_headers: Array,
  delimiter: String,
  data_id: Array,
  attributes: [SequenceAttribute],
  patient_attributes: Object,
  distance_threshold: {
    type: Number,
    require: true,
    min: 0,
    max: 0.02,
    default: 0.015,
    validate: [notEmptyValidator, "Distance Threshold is empty"]
  },
  min_overlap: {
    type: Number,
    require: true,
    min: 50,
    max: 5000,
    default: 500,
    validate: [notEmptyValidator, "Minimum Overlap is empty"]
  },
  fraction: {
    type: Number,
    require: true,
    min: 0,
    max: 1,
    default: 0.05
  },
  ambiguity_handling: {
    type: String,
    require: true,
    validate: [notEmptyValidator, "Ambiguity Handling field is empty"]
  },
  sequence_length: Number,
  job_started: { type: Boolean, default: false },
  status_stack: Array,
  status: {
    type: String
  },
  prealigned: Boolean,
  lanl_compare: Boolean,
  filter_edges: {
    type: String,
    enum: ["no", "report", "remove"]
  },
  strip_drams: {
    type: String,
    enum: ["no", "wheeler", "lewis"]
  },
  reference_strip: {
    type: String,
    enum: ["no", "report", "remove"]
  },
  patient_attributes: Object,
  torque_id: String,
  custom_reference: String,
  mail: String,
  type: String,
  tn93_summary: String,
  tn93_results: String,
  lanl_tn93_results: String,
  error_message: String,
  combine_same_id_diff_dates: Array,
  stdout: String,
  stderr: String,
  results: Object,

  // if not empty, then combine the ID (index 0) with the date (index 1)
  created: {
    type: Date,
    default: Date.now
  }
});

/**
 * Create an attribute map based off the header files of
 * a FASTA file
 */

HivTrace.virtual("valid_statuses").get(function() {
  return [
    "In Queue",
    "Aligning",
    "BAM to FASTA conversion",
    "Computing pairwise TN93 distances",
    "Inferring, filtering, and analyzing molecular transmission network",
    "Completed"
  ];
});

HivTrace.virtual("valid_lanl_statuses").get(function() {
  return [
    "In Queue",
    "Aligning",
    "BAM to FASTA conversion",
    "Computing pairwise TN93 distances",
    "Inferring, filtering, and analyzing molecular transmission network",
    "Computing pairwise TN93 distances against a public database",
    "Inferring connections to sequences in a public database",
    "Completed"
  ];
});

HivTrace.virtual("off_kilter_statuses").get(function() {
  return [
    "In Queue",
    "Aligning",
    "BAM to FASTA conversion",
    "Computing pairwise TN93 distances",
    "Inferring, filtering, and analyzing molecular transmission network",
    "Computing pairwise TN93 distances against a public database",
    "Inferring connections to sequences in a public database",
    "Completed"
  ];
});

/**
 * Filename of document's file upload
 */
HivTrace.virtual("filename").get(function() {
  return this._id;
});

/**
 * Complete file path for document's file upload
 */
HivTrace.virtual("filepath").get(function() {
  return __dirname + "/../../uploads/hivtrace/" + this._id;
});

HivTrace.virtual("analysistype").get(function() {
  return "hivtrace";
});

/**
 * file path for aligned document
 */
HivTrace.virtual("aligned_fasta_fn").get(function() {
  return __dirname + "/../../uploads/hivtrace/" + this._id + ".aligned.fa";
});

/**
 * file path for trace results
 */
HivTrace.virtual("trace_results").get(function() {
  return __dirname + "/../../uploads/hivtrace/" + this._id + ".trace.json";
});

/**
 * file path for trace results
 */
HivTrace.virtual("rel_trace_results").get(function() {
  return this._id + ".trace.json";
});

/**
 * relative file path for aligned document
 */
HivTrace.virtual("rel_aligned_fasta_fn").get(function() {
  return this._id + ".aligned.fa";
});

/**
 * TODO: Change storage to mongodb instead of file
 */
HivTrace.virtual("input_sequences").get(function() {
  return "/uploads/hivtrace/" + this._id;
});

/**
 * Index of status
 */
HivTrace.virtual("status_index").get(function() {
  if (this.status !== undefined) {
    return this.status_stack.indexOf(this.status);
  } else {
    return -1;
  }
});

/**
 * Percentage of job complete
 */
HivTrace.virtual("percentage_complete").get(function() {
  return ((this.status_index + 1) / this.status_stack.length) * 100 + "%";
});

/**
 * Unix timestamp
 */
HivTrace.virtual("timestamp").get(function() {
  return moment(this.created).unix();
});

/**
 * URL
 */
HivTrace.virtual("url").get(function() {
  return "http://" + setup.host + "/hivtrace/" + this._id;
});

HivTrace.methods.saveAttributes = function(cb) {
  var self = this;

  // Once annotations are configured, save the mapped attributes so that we
  // won't have to regenerate them every time the results page loads

  var delimiter = self.delimiter,
    headers = self.headers,
    attributes = self.attributes;

  var annotations = _.map(attributes, function(d) {
    return d.annotation;
  });

  var patient_attributes = _.map(headers, function(d) {
    var attrs = d.split(delimiter);
    var key_val = _.object(annotations, attrs);
    key_val["header"] = d;
    return key_val;
  });

  // save attributes for each patient
  self.patient_attributes = patient_attributes;

  cb(null, self);
};

HivTrace.methods.addAttributesToResults = function(cb) {
  var self = this;

  var attributes = self.patient_attributes;
  var attr_keys = _.keys(attributes[0]);

  var category_map = {
    categorical: "String",
    individual: "String",
    temporal: "Date"
  };

  // transform attributes to be a dictionary
  var attrs_by_id = _.object(
    _.map(attributes, function(item) {
      return [item.header, item];
    })
  );

  // return key, instance, and label
  patient_schema = _.object(
    _.map(self.attributes, function(d) {
      return d.annotation;
    }),
    _.map(self.attributes, function(val, key) {
      new_dict = { type: category_map[val.category], label: val.annotation };
      return new_dict;
    })
  );

  // read from trace results
  fs.readFile(self.trace_results, function(err, results) {
    if (err) {
      cb(err, null);
      return;
    }

    try {
      json_results = JSON.parse(results);

      json_results["trace_results"][
        "patient_attribute_schema"
      ] = patient_schema;

      // annotate each node with the attributes
      var nodes = _.map(json_results["trace_results"].Nodes, function(node) {
        return (node["patient_attributes"] = attrs_by_id[node["id"]]);
      });

      // annotate each singleton with the attributes
      if (json_results["trace_results"].Singletons) {
        var singletons = _.map(
          json_results["trace_results"].Singletons,
          function(node) {
            return (node["patient_attributes"] = attrs_by_id[node["id"]]);
          }
        );
      }

      cb(err, json_results);
    } catch (e) {
      cb(e, null);
    }
  });
};

// execute function on complete
HivTrace.methods.onComplete = function(data, publisher, channel) {
  var self = this;

  var redis_packet = {
    type: "completed"
  };

  // Write to database
  self.status = "completed";

  if (data) {
    // save results to file
    //self.results = data.results;
    fs.writeFile(self.trace_results, JSON.stringify(data.results), function(
      err
    ) {
      if (err) throw err;
      winston.info("saved results file");

      if (self.mail) {
        mailer.sendJobComplete(self);
      }

      //Update the status for the analysis
      self.save(function(err, result) {
        if (err) throw err;
        publisher.publish(channel, JSON.stringify(redis_packet));
      });
    });
    winston.info("job complete; got results");
  } else {
    winston.error("job complete, but no data received");
  }
};

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
};

/**
 * Validators to be passed to an html template as data attributes for
 * form validation
 */
HivTrace.statics.lanl_validators = function() {
  var validators = [];
  validators.min_overlap = HivTrace.paths.lanl_min_overlap.options;
  validators.distance_threshold =
    HivTrace.paths.lanl_distance_threshold.options;
  return validators;
};

HivTrace.statics.submitJob = function(result, cb) {
  winston.info(
    "submitting " + result.analysistype + " : " + result._id + " to cluster"
  );
  var jobproxy = new hpcsocket.HPCSocket(
    {
      filepath: result.filepath,
      msa: result.msa,
      analysis: result,
      status_stack: result.status_stack,
      type: result.analysistype
    },
    "spawn",
    cb
  );
};

HivTrace.statics.usageStatistics = function(cb) {
  var self = this;
  // Aggregation is done client-side
  self
    .find({ status: "completed" }, { created: 1 })
    .sort({ created: -1 })
    .limit(1)
    .exec(function(err1, items1) {
      if (err1 || items1.length == 0) {
        cb(err1, null);
        return;
      }
      self
        .find(
          {
            status: "completed",
            created: { $gt: moment(items1[0].created).subtract(1, "years") }
          },
          { _id: 0, created: 1 }
        )
        .exec(function(err, items) {
          cb(err, items);
        });
    });
};

module.exports = mongoose.model("HivTrace", HivTrace);
