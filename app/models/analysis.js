
var mongoose  = require('mongoose'),
    globals   = require( '../../config/globals.js'),
    moment    = require('moment'),
    _         = require('underscore'),
    winston   = require('winston'),
    hpcsocket = require( __dirname + '/../../lib/hpcsocket.js'),
    Msa       = require(__dirname + '/msa'),
    extend    = require('mongoose-schema-extend');


var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var AnalysisSchema = new Schema({
  msa                 : [Msa.MsaSchema],
  treemode            : Number,
  created             : {type: Date, default: Date.now},
  id                  : {type: Number, require: true},
  type                : {type: String, require: true},
  status              : String,
  torque_id           : String,
  creation_time       : Date,
  start_time          : Date,
  sendmail            : Boolean,
  mail                : String,
  error_message       : String,
  cpu_time            : Number
});

AnalysisSchema.virtual('since_created').get(function () {
    moment.lang('en');
    var time = moment(this.timestamp);
    return time.fromNow();
});

/**
 * Filename of document's file upload
 */
AnalysisSchema.virtual('valid_statuses').get(function () {
  return ['queue', 
          'running',
          'completed'];
});

AnalysisSchema.statics.pendingJobs = function (cb) {
  this.find({ $or: [ { "status": "queue" }, 
                     { "status": "running"} ] })
                        .populate('upload_id')
                        .exec(function(err, items) {
                          cb(err, items);
                         });
};

AnalysisSchema.statics.submitJob = function (result, cb) {

  winston.info('submitting ' + result.analysistype + ' : ' + result._id + ' to cluster');

  var jobproxy = new hpcsocket.HPCSocket({'filepath'    : result.filepath, 
                                          'msa'         : result.msa,
                                          'analysis'    : result,
                                          'status_stack': result.status_stack,
                                          'type'        : result.analysistype}, 'spawn', cb);

};



AnalysisSchema.statics.subscribePendingJobs = function () {
  this.pendingJobs(function(err, items) {
    _.each(items, function(item) { 
      item.resubscribe();
    });
  });
};

AnalysisSchema.statics.usageStatistics = function (cb) {

  // Aggregation is done client-side
  this.find({}, 'cpu_time created upload_id pvalue modelstring')
        .limit(1000)
        .populate('upload_id', 'sequences sites')        
        .exec( function(err, items) {
              cb(err, items);
             });

};

/**
 * unix timestamp
 */
AnalysisSchema.virtual('timestamp').get(function () {
  return moment(this.created).unix();
});

AnalysisSchema.methods.resubscribe = function () {

  var jobproxy = new hpcsocket.HPCSocket({'filepath'    : this.filepath, 
                                          'msa'         : this.msa,
                                          'analysis'    : this,
                                          'status_stack': this.status_stack,
                                          'type'        : this.analysistype}, 'resubscribe');

}

AnalysisSchema.methods.cancel = function (callback) {

  var jobproxy = new hpcsocket.HPCSocket({'filepath'    : this.filepath, 
                                          'msa'         : this.msa,
                                          'analysis'    : this,
                                          'status_stack': this.status_stack,
                                          'type'        : this.analysistype}, 'cancel', callback);

}

module.exports = AnalysisSchema;
