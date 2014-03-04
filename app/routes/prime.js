/*
  Datamonkey - An API for comparative analysis of sequence alignments using state-of-the-art statistical models.

  Copyright (C) 2013
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

var querystring = require('querystring'),
    error       = require( ROOT_PATH + '/lib/error.js'),
    globals     = require( ROOT_PATH + '/config/globals.js'),
    mailer      = require( ROOT_PATH + '/lib/mailer.js'),
    helpers     = require( ROOT_PATH + '/lib/helpers.js'),
    fs          = require('fs');

var mongoose = require('mongoose'),
    Msa = mongoose.model('Msa'),
    Prime = mongoose.model('Prime');


exports.createForm = function(req, res) {
  var upload_id = req.params.msaid;

  Msa.findOne({upload_id : upload_id}, function (err, uploadfile) {
    if (err || !uploadfile) {
      res.json(500, error.errorResponse('There is no sequence with id of ' + upload_id));
    } else {
      var ftc = []
      console.log(uploadfile);
      res.render('analysis/prime.ejs', { 'uploadfile' : uploadfile});
    }
  });
}

exports.invokeJob = function(req, res) {

  // Start job and go to analysis id page

  var type =  req.params.type;

  var postdata = req.query;
  var upload_id =  req.params.msaid;

  Msa.findOne({ 'upload_id' : upload_id }, function(err, msa) {

    var callback = function(err,result) {
      var num = 0;
      var highest_countid = 1;

      if(err) {
        res.json(500, error.errorResponse(err));
      }

      if(result != '' && result != null) {
        num = result.id;
        highest_countid = result.id + 1;
      }
      res.json(200, {'msg': 'good job'});
    }

    //Get count of this analysis
    Prime 
    .findOne({ upload_id : msa._id })
    .sort('-id')
    .select('id')
    .exec(callback)
  });

}

exports.getPrime = function(req, res) {
  // Find the analysis
  // Return its results
  var type =  req.params.type;

  var upload_id = req.params.upload_id,
      analysisid = req.params.analysisid;

  //Return all results
  Prime.findOne({upload_id : upload_id, id : analysisid}, function(err, item) {
    if (err || !item ) {
      res.json(500, error.errorResponse('Item not found'));
    } else {
      res.json(item);
    }
  });
}

exports.deletePrime = function(req, res) {
  // Find the analysis
  // Return its results
  var type =  req.params.type;

  var upload_id = req.params.upload_id,
      analysisid = req.params.analysisid;

  //Return all results
  Prime.findOneAndRemove({upload_id : upload_id, id : analysisid}, 
                   function(err, item) {
    if (err || !item) {
      res.json(500, error.errorResponse('Item not found: upload_id: ' + upload_id + ', id : ' + analysisid));
    } else {
      res.json({"success" : 1});
    }
  });
}
