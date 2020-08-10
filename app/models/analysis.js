var mongoose = require("mongoose"),
  setup = require("./../../config/setup"),
  moment = require("moment"),
  path = require("path"),
  _ = require("underscore"),
  winston = require("winston"),
  hpcsocket = require(__dirname + "/../../lib/hpcsocket.js"),
  Msa = require(__dirname + "/msa");

var redis = require("redis"),
  client = redis.createClient({
    host: setup.redisHost,
    port: setup.redisPort,
  });

var Schema = mongoose.Schema;

var AnalysisSchema = new Schema({
  msa: [Msa.MsaSchema],
  treemode: Number,
  created: { type: Date, default: Date.now },
  id: { type: Number, require: true },
  type: { type: String, require: true },
  status: String,
  torque_id: String,
  creation_time: Date,
  start_time: Date,
  sendmail: Boolean,
  mail: String,
  error_message: String,
  stderr: String,
  stdout: String,
  cpu_time: Number,
});

AnalysisSchema.virtual("since_created").get(function () {
  moment.lang("en");
  var time = moment(this.timestamp);
  return time.fromNow();
});

/**
 * Original file path for document's file upload
 */
AnalysisSchema.virtual("original_fn").get(function () {
  return path.resolve(
    __dirname +
      "/../../uploads/msa/" +
      this._id +
      "-original." +
      this.original_extension
  );
});

AnalysisSchema.virtual("max_sites").get(function () {
  return 12000;
});

AnalysisSchema.virtual("max_sequences").get(function () {
  return 500;
});

AnalysisSchema.virtual("input_data").get(function () {
  return {
    filename: this.msa[0].id,
    sequences: this.msa[0].sequences,
    sites: this.msa[0].sites,
  };
});

/**
 * Filename of document's file upload
 */
AnalysisSchema.virtual("valid_statuses").get(function () {
  return ["queue", "running", "completed"];
});

AnalysisSchema.statics.pendingJobs = function (cb) {
  this.find({
    $or: [{ status: "running" }],
  })
    .populate("upload_id")
    .exec(function (err, items) {
      cb(err, items);
    });
};

AnalysisSchema.statics.submitJob = function (job, cb) {
  winston.info(
    "submitting " + job.analysistype + " : " + job._id + " to cluster"
  );

  var jobproxy = new hpcsocket.HPCSocket(
    {
      filepath: job.filepath,
      msa: job.msa,
      analysis: job,
      status_stack: job.status_stack,
      type: job.analysistype,
    },
    "spawn",
    cb
  );
};

AnalysisSchema.statics.subscribePendingJobs = function () {
  this.pendingJobs(function (err, items) {
    _.each(items, function (item) {
      item.resubscribe();
    });
  });
};

AnalysisSchema.statics.usageStatistics = function (cb) {
  // Aggregation is done client-side
  var self = this;

  self
    .find({ status: "completed" }, { created: 1 })
    .sort({ created: -1 })
    .limit(1)
    .exec(function (err1, items1) {
      if (err1 || items1.length == 0) {
        cb(err1, null);
        return;
      }
      self
        .find(
          {
            status: "completed",
            created: {
              $gt: moment(items1[0].created).subtract(1, "years"),
            },
          },
          {
            _id: 0,
            created: 1,
            "msa.sites": 1,
            "msa.sequences": 1,
          }
        )
        .exec(function (err, items) {
          client.set(
            setup.database_name + "_" + self.collection.name + "_job_stats",
            JSON.stringify(items),
            (err, reply) => {}
          );
          cb(err, items);
        });
    });
};
/**
 * unix timestamp
 */
AnalysisSchema.virtual("timestamp").get(function () {
  return moment(this.created).unix();
});

AnalysisSchema.virtual("generic_error_msg").get(function () {
  var error_msg =
    'We\'re sorry, there was an error processing your job. Please try again, or visit <a href="http://github.com/veg/hyphy/issues/">our GitHub issues</a> and create an issue if the issue persists.';

  return error_msg;
});

AnalysisSchema.virtual("results_path").get(function () {
  return path.resolve(
    __dirname + "../../../results/jobs/" + this._id + "-results" + ".json"
  );
});

AnalysisSchema.methods.resubscribe = function () {
  var jobproxy = new hpcsocket.HPCSocket(
    {
      filepath: this.filepath,
      msa: this.msa,
      analysis: this,
      status_stack: this.status_stack,
      type: this.analysistype,
    },
    "resubscribe"
  );
};

AnalysisSchema.methods.cancel = function (callback) {
  var jobproxy = new hpcsocket.HPCSocket(
    {
      filepath: this.filepath,
      msa: this.msa,
      analysis: this,
      status_stack: this.status_stack,
      type: this.analysistype,
    },
    "cancel",
    callback
  );
};

AnalysisSchema.statics.cachePath = function () {
  return setup.database_name + "_" + this.collection.name + "_job_stats";
};

module.exports = AnalysisSchema;
