
var mongoose  = require('mongoose'),
    extend    = require('mongoose-schema-extend'),
    Msa       = require(__dirname + '/msa');

var AnalysisSchema = require(__dirname + '/analysis');

var aBSREL = AnalysisSchema.extend({
  analysis_type         : Number,
  last_status_msg       : String,
  results               : Object
});

aBSREL.virtual('pmid').get(function() {
  return '25540451';
});

aBSREL.virtual('analysistype').get(function() {
  return 'absrel';
});

aBSREL.virtual('upload_redirect_path').get(function() {
  return '/absrel/' + this._id;
});

/**
 * Complete file path for document's file upload
 */
aBSREL.virtual('filepath').get(function () {
  return __dirname + '/../../uploads/msa/' + this._id + '.fasta';
});

/**
 * Filename of document's file upload
 */
aBSREL.virtual('status_stack').get(function () {
  return ['queue', 
          'running',
          'completed'];
});

/**
 * URL for a busted path
 */
aBSREL.virtual('url').get(function () {
  return 'http://' + setup.host + '/absrel/' + this._id;
});


module.exports = mongoose.model('aBSREL', aBSREL);
