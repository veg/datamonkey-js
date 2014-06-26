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

var error     = require( ROOT_PATH + '/lib/error.js'),
    helpers   = require( ROOT_PATH + '/lib/helpers.js'),
    globals   = require( ROOT_PATH + '/config/globals.js'),
    mailer    = require( ROOT_PATH + '/lib/mailer.js'),
    fs        = require('fs'),
    hpcsocket = require( ROOT_PATH + '/lib/hpcsocket.js'),
    hiv_setup = require( ROOT_PATH + '/config/hivtrace_globals');
    setup     = require( ROOT_PATH + '/config/setup');

var mongoose = require('mongoose'),
    HivTrace = mongoose.model('HivTrace');


/**
 * Form submission page
 * app.get('/hivtrace', hivtrace.clusterForm);
 */
exports.clusterForm = function (req, res) {
  res.render('hivtrace/form.ejs', {'validators': HivTrace.validators()});
}

/**
 * Form submission page
 * app.post('/hivtrace/uploadfile', hivtrace.clusterForm);
 */
exports.uploadFile = function (req, res) {
  // Validate that the file uploaded was a FASTA file
  var hivtrace = new HivTrace;
  hivtrace.save(function (err, ht) {
    fs.rename(req.files.files.path, ht.filepath, function(err, result) {
      if(err) {
        // FASTA validation failed, report an error and the form back to the user
        res.json(200, {'error': { 'file' : err.msg }});
      } else {
        hivtrace.save(function (err, result) {
          res.json(200, {'result': ht});
        });
      }
    });
  });
}

/**
 * An AJAX request that verifies the upload is correct
 * app.post('/hivtrace/upload/:id', hivtrace.verifyUpload);
 */
exports.verifyUpload = function (req, res) {

  var postdata = req.body;
  var id = req.params.id;

  HivTrace.findOne({_id: id}, function (err, hivtrace) {
    if(postdata.public_db_compare == 'true') {
      hivtrace.lanl_compare = true;
      hivtrace.status_stack = hiv_setup.valid_lanl_statuses;
    } else {
      hivtrace.lanl_compare = false;
      hivtrace.status_stack = hiv_setup.valid_statuses;
    }

    hivtrace.distance_threshold = Number(postdata.distance_threshold);
    hivtrace.min_overlap        = Number(postdata.min_overlap);
    hivtrace.ambiguity_handling = postdata.ambiguity_handling;
    hivtrace.status             = hivtrace.status_stack[0];

    if(postdata.receive_mail == 'on') {
      hivtrace.mail = postdata.mail;
    }

    // Validate that the file uploaded was a FASTA file
    hivtrace.save(function (err, result) {

      var hivtrace_id = result._id;
      if(err) {
        res.json(200, {'error'     : err.error, 
                       'validators': HivTrace.validators()});

      } else {

        HivTrace.createAttributeMap(result.filepath, function(err, result) {
          parsed_attributes = HivTrace.parseHeaderFromMap(result.headers[0], result);
          res.format({

            html: function() {
              res.render('hivtrace/attribute_map_assignment.ejs', { 'map'           : result, 
                                                                    'example_parse' : parsed_attributes, 
                                                                    'hivtrace_id'   : hivtrace_id, 
                                                                    'error'         : err, 
                                                                    'validators'    : HivTrace.validators() });
            },

            json: function(){
              res.json(200, { 'map'           : result, 
                              'example_parse' : parsed_attributes, 
                              'hivtrace_id'   : hivtrace_id, 
                              'error'         : err, 
                              'validators'    : HivTrace.validators() });
            }

          });
        });
      }
    });
  });
}

/**
 * Handles a job request by the user
 * app.post('/hivtrace', hivtrace.invokeClusterAnalysis);
 */
exports.invokeClusterAnalysis = function (req, res) {

  var postdata = req.body;
  var id    = req.params.id;

  HivTrace.findOne({_id: id}, function (err, hivtrace) {
    hivtrace.attribute_map = postdata;
    hivtrace.save(function (err, result) {
      if(err) {
          // Redisplay form with error
          res.format({
            html: function(){
              res.render('hivtrace/form.ejs', {'error': err.error, 
                         'validators': HivTrace.validators()});
            },

            json: function(){
              res.json(200, {'result': data});
            }
          });
      } else {

        // Send the MSA, and type
        var jobproxy = new hpcsocket.HPCSocket({'filepath': result.filepath, 
                                                'analysis': result,
                                                'status_stack': result.status_stack,
                                                'type': 'hivtrace'}, callback);

        function callback(data) {
          res.format({

            json: function(){
              res.json(200, '/hivtrace/' + result._id);
            },

            html: function() {
              res.redirect(result._id);
            }
          });
        }
      }
    });
  });
}


/**
 * Displays the page for the specified document
 * app.get('/hivtrace/:id', hivtrace.jobPage);
 */
exports.jobPage = function (req, res) {

  // HIV Cluster id
  var id = req.params.id;
  HivTrace.findOne({_id: id}, function (err, hivtrace) {
    if (err || !hivtrace) {
      res.json(500, error.errorResponse('There is no HIV Cluster job with id of ' + id));
    } else {
      res.format({
        json: function(){
          res.json(200, hivtrace);
        },
        html: function(){
          res.render('hivtrace/jobpage.ejs', {hivtrace : hivtrace, socket_addr: 'http://' + setup.host + ':' + setup.socket_port });
        }
      });
    }
  });

}

/**
 * Returns strictly JSON results for requested job id
 * app.get('/hivtrace/:id/results', hivtrace.results);
 */
exports.results = function (req, res) {

  // HIV Cluster id
  var id = req.params.id;
  HivTrace.findOne({_id: id}, 'tn93_summary tn93_results trace_results lanl_trace_results', function (err, hivtrace) {
    if (err || !hivtrace) {
      res.json(500, error.errorResponse('There is no HIV Cluster job with id of ' + id));
    } else {
      res.format({
        html: function(){
          res.render('hivtrace/results.ejs', {hivtrace : hivtrace});
        },
        json: function(){
          res.render('hivtrace/results.ejs', {hivtrace : hivtrace});
        }
      });
    }
  });

}

/**
 * Returns strictly JSON results for requested job id
 * app.get('/hivtrace/:id/attributes', hivtrace.results);
 */
exports.attributemap = function (req, res) {
  var id = req.params.id;

  HivTrace.findOne({_id: id}, 'attribute_map', function (err, hivtrace) {
    if (err || !hivtrace) {
      res.json(500, error.errorResponse('There is no HIV Cluster job with id of ' + id));
    } else {
      res.json({hivtrace : hivtrace});
    }
  });

}

