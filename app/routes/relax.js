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

var querystring = require('querystring'),
    error       = require( __dirname + ' /../../lib/error.js'),
    globals     = require( __dirname + '/../../config/globals.js'),
    mailer      = require( __dirname + '/../../lib/mailer.js'),
    helpers     = require( __dirname + '/../../lib/helpers.js'),
    hpcsocket   = require( __dirname + '/../../lib/hpcsocket.js'),
    fs          = require('fs'),
    logger     = require('../../lib/logger');

var mongoose = require('mongoose'),
    Msa = mongoose.model('Msa'),
    Sequences =  mongoose.model('Sequences'),
    PartitionInfo =  mongoose.model('PartitionInfo'),
    Relax = mongoose.model('Relax');

exports.createForm = function(req, res) {
  res.render('relax/upload_msa.ejs');
}

exports.uploadFile = function(req, res) {

  var fn = req.files.files.path;
  var postdata  = req.body;
  var datatype  = postdata.datatype;
  var gencodeid = postdata.gencodeid;

  if(postdata.receive_mail == 'true') {
    relax.mail = postdata.mail;
  }


  Msa.parseFile(fn, datatype, gencodeid, function(err, msa) {

    var relax = new Relax;

    relax.msa = msa;

    if(err) {
      res.json(500, {'error' : err});
      return;
    }

    relax.save(function (err, relax_result) {

      if(err) {
        logger.error("relax save failed");
        logger.error(err);
        res.json(500, {'error' : err});
        return;
      }

      function move_cb(err, result) {
        if(err) {
          logger.error(err);
          logger.error("relax rename failed");
          res.json(500, {'error' : err});
        } else {
          res.json(200,  relax);
        }
      }

      helpers.moveSafely(req.files.files.path, relax_result.filepath, move_cb);

    });
  });
}

exports.selectForeground = function(req, res) {

  var id = req.params.id;

  Relax.findOne({_id: id}, function (err, relax) {
      res.format({
        html: function() {
          res.render('relax/form.ejs', {'relax' : relax});
        },
        json: function(){
          res.json(200, relax);
        }
      });
  });
}

/**
 * Handles a job request by the user
 * app.post('/msa/:msaid/relax', Relax.invokeRelax);
 */
exports.invokeRelax = function(req, res) {

  var postdata = req.body;
  var id = req.params.id;

  // Find the correct multiple sequence alignment to act upon
  Relax.findOne({ '_id' : id }, function(err, relax) {

    // User Parameters
    relax.tagged_nwk_tree = postdata.nwk_tree;
    relax.analysis_type   = postdata.analysis_type;
    relax.status          = relax.status_stack[0];

    relax.save(function (err, result) {

      if(err) {
        // Redisplay form with errors
        res.format({
          html: function() {
            res.render('relax/form.ejs', {'errors': err.errors,
                                                    'relax' : relax});
          },
          json: function() {
            // Save relax analysis
            res.json(200, {'msg': 'Job with relax id ' + id + ' not found'});
          }
        });

      // Successful upload, spawn job
      } else {

        var connect_callback = function(data) {
          if(data == 'connected') {
            // TODO: why is this empty?
            logger.log('connected');
          }
        }

        res.json(200,  {'relax' : result});

        // Send the MSA and analysis type
        var jobproxy = new hpcsocket.HPCSocket({'filepath'    : result.filepath, 
                                                'msa'         : result.msa,
                                                'analysis'    : result,
                                                'status_stack': result.status_stack,
                                                'type'        : 'relax'}, connect_callback);
      }
    });
  });
}

/**
 * Displays id page for analysis
 * app.get('/relax/:relaxid', relax.getRelax);
 */
exports.getRelax = function(req, res) {

  // Find the analysis
  // Return its results
  var relaxid = req.params.relaxid;

  //Return all results
  Relax.findOne({_id : relaxid}, function(err, relax) {
    if (err || !relax ) {
      logger.error(err);
      res.json(500, error.errorResponse('Invalid ID : ' + relaxid ));
    } else {
      if(!relax.torque_id) {
        relax.torque_id = 'N/A';
      }
      // Should return results page
      res.render('relax/jobpage.ejs', { job : relax, 
                                        socket_addr: 'http://' + setup.host + ':' + setup.socket_port 
                                       });
    }
  });
}

/**
 * Displays id page for analysis
 * app.get('/msa/:msaid/relax/:relaxid/results', relax.getRelaxResults);
 */
exports.getRelaxResults = function(req, res) {

  var relaxid = req.params.relaxid;

  //Return all results
  Relax.findOne({_id : relaxid}, function(err, relax) {
    if (err || !relax ) {
      logger.error(err);
      res.json(500, error.errorResponse('invalid id : ' + relaxid ));
    } else {
      // Should return results page
      // Append PMID to results
      var relax_results =  JSON.parse(relax.results);
      relax_results['PMID'] = relax.pmid;
      res.json(200, relax_results);
    }
  });
}

/**
 * Handles a job request by the user
 * app.post('/msa/:msaid/relax', Relax.invokeRelax);
 */
exports.restartRelax = function(req, res) {

  var id = req.params.relaxid;

  // Find the correct multiple sequence alignment to act upon
  Relax.findOne({ '_id' : id }, function(err, result) {
    if(err) {
      // Redisplay form with errors
      res.format({
        html: function() {
          res.render('analysis/relax/form.ejs', {'errors': err.errors,
                                                  'relax' : relax});
        },
        json: function() {
          // Save relax analysis
          res.json(200, {'msg': 'Job with relax id ' + id + ' not found'});
        }
      });

    // Successful upload, spawn job
    } else {

      var connect_callback = function(data) {
        if(data == 'connected') {
          // TODO: why is this empty?
          logger.log('connected');
        }
      }

      res.json(200,  {'relax' : result});

      // Send the MSA and analysis type
      var jobproxy = new hpcsocket.HPCSocket({'filepath'    : result.filepath, 
                                              'msa'         : result.msa,
                                              'analysis'    : result,
                                              'status_stack': result.status_stack,
                                              'type'        : 'relax'}, connect_callback);
    }
  });
}

/*
 * Displays id page for analysis
 * app.get('/relax/:relaxid', relax.getRelax);
 */
exports.getRelaxRecheck = function(req, res) {

  // Find the analysis
  // Return its results
  var relaxid = req.params.relaxid;

  //Return all results
  Relax.findOne({_id : relaxid}, function(err, relax) {
    if (err || !relax ) {
      logger.error(err);
      res.json(500, error.errorResponse('Invalid ID : ' + relaxid ));
    } else {

        var callback = function(data) {
          res.json(200,  data);
        }


      // Send the MSA and analysis type
      var jobproxy = new hpcsocket.HPCSocketRecheck({'filepath'    : relax.filepath, 
                                              'msa'         : relax.msa,
                                              'analysis'    : relax,
                                              'status_stack': relax.status_stack,
                                              'type'        : 'relax'}, callback);
    }

  });
}

