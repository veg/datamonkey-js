var mongoose  = require('mongoose'),
    extend    = require('mongoose-schema-extend'),
    Msa       = require(__dirname + '/msa');

var AnalysisSchema = require(__dirname + '/analysis');

var FUBAR = AnalysisSchema.extend({
  analysis_type         : Number,
  last_status_msg       : String,
  results               : Object
});

FUBAR.virtual('pmid').get(function() {
  return '22807683';
});

FUBAR.virtual('analysistype').get(function() {
  return 'fubar';
});

FUBAR.virtual('upload_redirect_path').get(function() {
  return '/fubar/' + this._id;
});

/**
 * Complete file path for document's file upload
 */
FUBAR.virtual('filepath').get(function () {
  return __dirname + '/../../uploads/msa/' + this._id + '.fasta';
});

/**
 * Filename of document's file upload
 */
FUBAR.virtual('status_stack').get(function () {
  return ['queue', 
          'running',
          'completed'];
});

/**
 * URL for a busted path
 */
FUBAR.virtual('url').get(function () {
  return 'http://' + setup.host + '/fubar/' + this._id;
});


module.exports = mongoose.model('FUBAR', FUBAR);
