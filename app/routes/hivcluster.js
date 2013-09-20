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

var dpl       = require( ROOT_PATH + '/lib/datamonkey-pl.js'),
    error     = require( ROOT_PATH + '/lib/error.js'),
    helpers   = require( ROOT_PATH + '/lib/helpers.js'),
    globals   = require( ROOT_PATH + '/config/globals.js'),
    mailer    = require( ROOT_PATH + '/lib/mailer.js'),
    fs        = require('fs'),
    jobproxy  = require( ROOT_PATH + "/lib/hivcluster.js"),
    hiv_setup = require( ROOT_PATH + '/config/hiv_cluster_globals');

var mongoose = require('mongoose'),
    HivCluster = mongoose.model('HivCluster');


/**
 * Form submission page
 * app.get('/hivcluster', hivcluster.clusterForm);
 */
exports.clusterForm = function (req, res) {
  res.render('hivcluster/form.ejs', {'validators': HivCluster.validators()});
}

/**
 * Handles a job request by the user
 * app.post('/hivcluster', hivcluster.invokeClusterAnalysis);
 */
exports.invokeClusterAnalysis = function (req, res) {

  var hiv_cluster = new HivCluster;

  var postdata = req.body;

  if(postdata.public_db_compare == 'yes') {
    hiv_cluster.lanl_compare = true;
    hiv_cluster.status_stack = hiv_setup.valid_lanl_statuses;
  } else {
    hiv_cluster.lanl_compare = false;
    hiv_cluster.status_stack = hiv_setup.valid_statuses;
  }

  hiv_cluster.distance_threshold = Number(postdata.distance_threshold);
  hiv_cluster.min_overlap        = Number(postdata.min_overlap);
  hiv_cluster.ambiguity_handling = postdata.ambiguity_handling;
  hiv_cluster.status             = hiv_cluster.status_stack[0];

  if(postdata.receive_mail == 'on') {
    hiv_cluster.mail = postdata.mail;
  }

  // Validate that a file was uploaded
  if (req.files.files.size == 0) {
    // Error, show form again
    res.format({
      html: function(){
        res.render('hivcluster/form.ejs', {'errors' : { 'file' : "Empty File"}, 'validators': HivCluster.validators() });
      },
      json: function(){
        res.json(200, {'err': "Empty File"});
      }
    });
    return;
  }

  // Validate that the file uploaded was a FASTA file
  HivCluster.validateFasta(req.files.files.path, function(result) {
    if(!result.success) {
      // FASTA validation failed, report an error and the form back to the user
      res.format({
        html: function(){
          res.render('hivcluster/form.ejs', {'errors': { 'file' : result.msg }, 'validators': HivCluster.validators() });
        },
        json: function(){
          res.json(200, {'err': "Empty File"});
        }
      });
    } else {
      hiv_cluster.save(function (err, result) {
        if(err) {
            // Redisplay form with errors
            res.format({
              html: function(){
                res.render('hivcluster/form.ejs', {'errors': err.errors, 
                           'validators': HivCluster.validators()});
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
                  res.redirect('hivcluster/' + result._id);
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
 * app.get('/hivcluster/:id', hivcluster.jobPage);
 */
exports.jobPage = function (req, res) {

  // HIV Cluster id
  var id = req.params.id;
  HivCluster.findOne({_id: id}, function (err, hiv_cluster) {
    if (err || !hiv_cluster) {
      res.json(500, error.errorResponse('There is no HIV Cluster job with id of ' + id));
    } else {
      res.format({
        json: function(){
          res.json(200, hiv_cluster);
        },
        html: function(){
          res.render('hivcluster/jobpage.ejs', {hiv_cluster : hiv_cluster});
        }
      });
    }
  });

}

/**
 * Returns strictly JSON results for requested job id
 * app.get('/hivcluster/:id/results', hivcluster.results);
 */
exports.results = function (req, res) {
  // HIV Cluster id
  var id = req.params.id;
  HivCluster.findOne({_id: id}, 'tn93_summary cluster_results lanl_cluster_results', function (err, hiv_cluster) {
    if (err || !hiv_cluster) {
      res.json(500, error.errorResponse('There is no HIV Cluster job with id of ' + id));
    } else {
      results = {};
      res.format({
        html: function(){
          res.render('hivcluster/results.ejs', {hiv_cluster : hiv_cluster});
        },
        json: function(){
          res.render('hivcluster/results.ejs', {hiv_cluster : hiv_cluster});
        }
      });
    }
  });

}



