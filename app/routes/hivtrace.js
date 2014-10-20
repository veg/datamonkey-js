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

var logger = require(ROOT_PATH + '/lib/logger');

var error     = require( ROOT_PATH + '/lib/error.js'),
    helpers   = require( ROOT_PATH + '/lib/helpers.js'),
    globals   = require( ROOT_PATH + '/config/globals.js'),
    mailer    = require( ROOT_PATH + '/lib/mailer.js'),
    fs        = require('fs'),
    hpcsocket = require( ROOT_PATH + '/lib/hpcsocket.js'),
    hiv_setup = require( ROOT_PATH + '/config/hivtrace_globals'),
    setup     = require( ROOT_PATH + '/config/setup');

var mongoose = require('mongoose'),
    HivTrace = mongoose.model('HivTrace'),
    Msa = mongoose.model('Msa');


/**
* Form submission page
* app.post('/hivtrace/uploadfile', hivtrace.clusterForm);
*/
exports.uploadFile = function (req, res) {

  var postdata = req.body;
  var id = req.params.id;

  // Validate that the file uploaded was a FASTA file
  var hivtrace = new HivTrace;
  if(postdata.public_db_compare == 'true') {
    hivtrace.lanl_compare = true;
    hivtrace.status_stack = hiv_setup.valid_lanl_statuses;
  } else {
    hivtrace.lanl_compare = false;
    hivtrace.status_stack = hiv_setup.valid_statuses;
  }

  hivtrace.distance_threshold = Number(postdata.distance_threshold);
  hivtrace.min_overlap = Number(postdata.min_overlap);
  hivtrace.ambiguity_handling = postdata.ambiguity_handling;
  hivtrace.reference = postdata.reference;
  //hivtrace.status = hivtrace.status_stack[0];

  if(hivtrace.ambiguity_handling == "RESOLVE") {
    logger.log(postdata.fraction);
    if(postdata.fraction == undefined) {
      hivtrace.fraction = 1;
    } else {
      hivtrace.fraction = postdata.fraction;
    }
  }

  if(postdata.receive_mail == 'on') {
    hivtrace.mail = postdata.mail;
  }


  hivtrace.save(function (err, ht) {
    if(err) {
      logger.log(err);
      res.json(200, {'error' : err,
                     'validators': HivTrace.validators()});
      return;
    }

    function move_cb(err, result) {
      if(err) {
        logger.log(err);
        res.json(200, {'error' : err.error,
                       'validators': HivTrace.validators()});
      } else {
        res.json(200,  ht);
      }
    }
    helpers.moveSafely(req.files.files.path, ht.filepath, move_cb);
  });

}

/**
 * Form submission page
 * app.get('/hivtrace', hivtrace.clusterForm);
 */
exports.clusterForm = function (req, res) {
  res.render('analysis/hivtrace/form.ejs', {'validators': HivTrace.validators()});
}

/**
 * Handles a job request by the user
 * app.post('/hivtrace', hivtrace.invokeClusterAnalysis);
 */
exports.invokeClusterAnalysis = function (req, res) {
  var id = req.params.id;
  HivTrace.findOne({_id: id}, function (err, hivtrace) {
    if(err) {
        // Redisplay form with error
        res.format({
          html: function(){
            res.render('analysis/hivtrace/form.ejs', {'error': err.error, 
                       'validators': HivTrace.validators()});
          },

          json: function(){
            res.json(200, {'result': data});

          }
        });

    } else {


      
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
      if(hivtrace.status == undefined) {

        function callback(err) {
          if (err) {
            logger.error(err);
          } else {
            logger.info("successfully connected to cluster");
          }
        }

        // Send the MSA, and type
        var jobproxy = new hpcsocket.HPCSocket({'filepath'    : hivtrace.filepath, 
                                                'msa'         : hivtrace,
                                                'analysis'    : hivtrace,
                                                'status_stack': hivtrace.status_stack,
                                                'type'        : 'hivtrace'}, callback);

      }

      res.format({
        json: function(){
          res.json(200, hivtrace);
        },
        html: function(){
          res.render('analysis/hivtrace/jobpage.ejs', {hivtrace : hivtrace, socket_addr: 'http://' + setup.host + ':' + setup.socket_port });
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
  HivTrace.findOne({_id: id}, 'tn93_summary tn93_results trace_results lanl_compare', function (err, hivtrace) {
    if (err || !hivtrace) {
      res.json(500, error.errorResponse('There is no HIV Cluster job with id of ' + id));
    } else {
      logger.log(hivtrace);
      res.format({
        html: function(){
          res.render('analysis/hivtrace/results.ejs', {hivtrace : hivtrace});
        },
        json: function(){
          res.render('analysis/hivtrace/results.ejs', {hivtrace : hivtrace});
        }
      });
    }
  });

}

/**
 * An AJAX request that verifies the upload is correct
 * app.post('/msa/:id/map-attributes', msa.mapAttributes);
 */
exports.mapAttributes = function (req, res) {

  var id = req.params.id;

  HivTrace.findOne({_id: id}, function (err, hivtrace) {
    if(err) {
      res.format({
        html: function() {
          res.render('analysis/hivtrace/attribute_map_assignment.ejs', { 'error' : err});
        },
        json: function() {
          res.json(200, err);
        }
      });
    } else {
      // Validate that the file uploaded was a FASTA file
      HivTrace.createAttributeMap(hivtrace.filepath, function(err, hivtrace_map) {
        parsed_attributes = HivTrace.parseHeaderFromMap(hivtrace_map.headers[0], hivtrace_map);
        res.format({
          html: function() {
            res.render('analysis/hivtrace/attribute_map_assignment.ejs', { 'map'           : hivtrace_map, 
                                                                  'example_parse' : parsed_attributes, 
                                                                  'hivtrace_id'   : hivtrace._id,
                                                                  'error'         : err
                                                                });
          },
          json: function(){
            res.json(200, { 'map'           : hivtrace_map, 
                            'example_parse' : parsed_attributes, 
                            'hivtrace_id'   : hivtrace._id, 
                            'error'         : err
                            });
          }
        });
      });
    }
  });
}

exports.saveAttributes = function (req, res) {

  var id = req.params.id;
  var postdata = req.body;

  HivTrace.findOne({_id: id}, function (err, hivtrace) {
    hivtrace.attribute_map = postdata;
    hivtrace.save(function (err, hivtrace) {
      if(err) {
        // FASTA validation failed, report an error and the form back to the user
        res.json(200, err);
      } else {
        res.json(200,  {success: true});
      }
    });
  });

}


/**
 * Returns strictly JSON results for requested job id
 * app.get('/hivtrace/:id/attributes', hivtrace.results);
 */
exports.attributeMap = function (req, res) {
  var id = req.params.id;
  HivTrace.findOne({_id: id}, 'attribute_map', function (err, hivtrace) {
    if (err || !hivtrace) {
      res.json(500, error.errorResponse('There is no HIV Cluster job with id of ' + id));
    } else {
      res.json({hivtrace : hivtrace});
    }
  });
}
