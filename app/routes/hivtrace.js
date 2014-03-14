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
    jobproxy  = require( ROOT_PATH + "/lib/hivtrace.js"),
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
 * Handles a job request by the user
 * app.post('/hivtrace', hivtrace.invokeClusterAnalysis);
 */
exports.invokeClusterAnalysis = function (req, res) {

  var hivtrace = new HivTrace;
  var postdata = req.body;

  if(postdata.public_db_compare == 'yes') {
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

  // Validate that a file was uploaded
  if (req.files.files.size == 0) {
    // Error, show form again
    res.format({
      html: function(){
        res.render('hivtrace/form.ejs', {'errors' : { 'file' : "Empty File"}, 'validators': HivTrace.validators() });
      },
      json: function(){
        res.json(200, {'err': "Empty File"});
      }
    });
    return;
  }

  // Validate that the file uploaded was a FASTA file
  HivTrace.validateFasta(req.files.files.path, function(result) {
    if(!result.success) {
      // FASTA validation failed, report an error and the form back to the user
      res.format({
        html: function(){
          res.render('hivtrace/form.ejs', {'errors': { 'file' : result.msg }, 'validators': HivTrace.validators() });
        },
        json: function(){
          res.json(200, {'err': "Empty File"});
        }
      });
    } else {
      hivtrace.save(function (err, result) {
        if(err) {
            // Redisplay form with errors
            res.format({
              html: function(){
                res.render('hivtrace/form.ejs', {'errors': err.errors, 
                           'validators': HivTrace.validators()});
              },
              json: function(){
                res.json(200, {'result': data});
              }
            });
        } else {
          // Successful upload, copy the tmp uploaded file to our 
          // specified storage location as per setup.js
          fs.readFile(req.files.files.path, function (err, data) {
            var new_path = result.filepath;
            fs.writeFile(new_path, data, function (err) {
              var hpcsocket = new jobproxy.HPCSocket(result);
              res.format({
                json: function(){
                  res.json(200, result);
                },
                html: function(){
                  res.redirect('hivtrace/' + result._id);
                }
              });
            });
          }); 
        }
      });
    } 
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
  // HIV Cluster ID
  // TODO: Have an options for CSV
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
