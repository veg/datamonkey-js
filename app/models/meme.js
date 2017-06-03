var mongoose  = require('mongoose'),
    extend    = require('mongoose-schema-extend'),
    Msa       = require(__dirname + '/msa');

var AnalysisSchema = require(__dirname + '/analysis');

var MEME = AnalysisSchema.extend({
  analysis_type         : Number,
  last_status_msg       : String,
  results               : Object
});

MEME.virtual('pmid').get(function() {
  return '22807683';
});

MEME.virtual('analysistype').get(function() {
  return 'meme';
});

MEME.virtual('upload_redirect_path').get(function() {
  return '/meme/' + this._id;
});

/**
 * Complete file path for document's file upload
 */
MEME.virtual('filepath').get(function () {
  return __dirname + '/../../uploads/msa/' + this._id + '.fasta';
});

/**
 * Filename of document's file upload
 */
MEME.virtual('status_stack').get(function () {
  return ['queue', 
          'running',
          'completed'];
});

/**
 * URL for a busted path
 */
MEME.virtual('url').get(function () {
  return 'http://' + setup.host + '/meme/' + this._id;
});


module.exports = mongoose.model('MEME', MEME);
