
var mongoose = require('mongoose'),
    extend  = require('mongoose-schema-extend'),
    winston = require('winston'),
    path = require('path'),
    Msa = require(path.join(__dirname, '/msa'));

var AnalysisSchema = require(path.join(__dirname, '/analysis'));

var Fade = AnalysisSchema.extend({
  fg_branches           : String,
  last_status_msg       : String,
  results               : Object
});

Fade.virtual('analysistype').get(function() {
  return 'fade';
});

Fade.virtual('pmid').get(function() {
  return 'NA';
});

/**
 * Filename of document's file upload
 */
Fade.virtual('status_stack').get(function () {
  return ['queue', 
          'running',
          'completed'];
});

/**
 * Complete file path for document's file upload
 */
Fade.virtual('filepath').get(function () {
  return path.join(__dirname, '/../../uploads/msa/', this._id + '.fasta');
});

/**
 * URL for a fade path
 */
Fade.virtual('url').get(function () {
  return 'http://' + setup.host + '/fade/' + this._id;
});


module.exports = mongoose.model('Fade', Fade);
