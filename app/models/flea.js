/*

  Datamonkey - An API for comparative analysis of sequence alignments using state-of-the-art statistical models.

  Copyright (C) 2015
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

var mongoose  = require('mongoose'),
    extend    = require('mongoose-schema-extend'),
    fs        = require('fs'),
    path      = require('path'),
    tar       = require('tar-fs'),
    _         = require ('underscore'),
    hpcsocket = require( path.join(__dirname,'/../../lib/hpcsocket.js')),
    winston   = require('winston'),
    Msa       = require(__dirname + '/msa');

var AnalysisSchema = require(__dirname + '/analysis');

var Flea = AnalysisSchema.extend({
  msas                  : [Msa.MsaSchema],
  last_status_msg       : String,
  mail                  : String,
  results               : Object,
  rates                 : Object,
  frequencies           : Object,
  trajectory            : Object,
  gene                  : Object,
  trees                 : Object,
  neutralization        : Object
});

Flea.virtual('analysistype').get(function() {
  return 'flea';
});


/**
 * Filename of document's file upload
 */
Flea.virtual('status_stack').get(function () {

  return ['transferring', 
          'preparing_data',
          'queued',
          'running', 
          'completed'];
});

/**
 * Complete file path for document's file upload
 */
Flea.virtual('filepath').get(function () {
  return __dirname + '/../../uploads/flea/' + this._id + '.tar';
});

/**
 * Complete file path for document's file upload
 */
Flea.methods.filesize = function (cb) {

  var bytes = 0;
  fs.stat(path.join(__dirname, '/../../uploads/flea/', this._id + '.tar'), function(err, data) {
    if(data) {
      bytes = data.size;
    }
    cb(err, bytes);
  });

}


/**
 * Complete file path for document's file upload
 */
Flea.virtual('filedir').get(function () {
  return __dirname + '/../../uploads/flea/' + this._id + '/';
});


/**
 * URL for a envmonkey path
 */
Flea.virtual('url').get(function () {
  return 'http://' + setup.host + '/flea/' + this._id;
});

Flea.statics.pack = function(flea) {
  return tar.pack(flea.filedir).pipe(fs.createWriteStream(flea.filepath));
}

Flea.statics.submitJob = function (result, cb) {

  winston.info('submitting ' + result.analysistype + ' : ' + result._id + ' to cluster');

  this.pack(result);

  var jobproxy = new hpcsocket.HPCSocket({'filepath'    : result.filepath, 
                                          'msas'        : result.msas,
                                          'analysis'    : result,
                                          'status_stack': result.status_stack,
                                          'type'        : result.analysistype}, 'spawn', cb);

};


module.exports = mongoose.model('Flea', Flea);

