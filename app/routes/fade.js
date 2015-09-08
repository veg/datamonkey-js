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
    path = require('path'),
    error       = require(path.join(__dirname, '/../../lib/error.js')),
    globals     = require(path.join(__dirname, '/../../config/globals.js')),
    mailer      = require(path.join(__dirname, '/../../lib/mailer.js')),
    helpers     = require(path.join(__dirname, '/../../lib/helpers.js')),
    hpcsocket   = require(path.join(__dirname, '/../../lib/hpcsocket.js')),
    fs          = require('fs'),
    winston     = require('winston'),
    logger      = require('../../lib/logger');

var mongoose = require('mongoose'),
    Msa = mongoose.model('Msa'),
    Sequences =  mongoose.model('Sequences'),
    PartitionInfo =  mongoose.model('PartitionInfo'),
    Fade = mongoose.model('Fade');

exports.createForm = function(req, res) {
  res.render('fade/upload_msa.ejs');
};

exports.uploadFile = function(req, res) {

  var data = req.body;
  var fn = req.files.files.path;

  var fade = new Fade();
  var postdata = req.body;

  var msa = new Msa();

  msa.datatype  = data.datatype;
  msa.gencodeid = data.gencodeid;

  if(postdata.receive_mail == 'true') {
    fade.mail = postdata.mail;
  }

  msa.dataReader(fn, function(err, result) {

    if(err) {
      logger.error(err);
      res.json(500, {'error' : err});
      return;
    }

    var fpi        = result.FILE_PARTITION_INFO;
    var file_info  = result.FILE_INFO;
    msa.partitions = file_info.partitions;
    msa.gencodeid  = file_info.gencodeid;
    msa.sites      = file_info.sites;
    msa.sequences  = file_info.sequences;
    msa.timestamp  = file_info.timestamp;
    msa.goodtree   = file_info.goodtree;
    msa.nj         = file_info.nj;
    msa.rawsites   = file_info.rawsites;
    var sequences  = result.SEQUENCES;
    msa.sequence_info = [];

    for (var i in sequences) {
      var sequences_i = new Sequences(sequences[i]);
      msa.sequence_info.push(sequences_i);
    }

    //Ensure that all information is there
    var partition_info = new PartitionInfo(fpi);
    msa.partition_info = partition_info;

    fade.msa = msa;

    fade.save(function (err, fade_result) {
    if(err) {
      logger.error("fade save failed");
      logger.error(err);
      res.json(500, {'error' : err});
      return;
    }

    function move_cb(err, result) {
      if(err) {
        logger.error(err);
        logger.error("fade rename failed");
        res.json(500, {'error' : err});
      } else {
        res.json(200,  fade);
      }
    }
    helpers.moveSafely(req.files.files.path, fade_result.filepath, move_cb);
  });


  });
};

exports.selectForeground = function(req, res) {

  var id = req.params.id;

  Fade.findOne({_id: id}, function (err, fade) {
      res.format({
        html: function() {
          res.render('fade/form.ejs', {'fade' : fade});
        },
        json: function(){
          res.json(200, fade);
        }
      });
  });
};

/**
 * Handles a job request by the user
 * app.post('/fade', Fade.invokeFade);
 */
exports.invokeFade = function(req, res) {

  var postdata = req.body;
  var id = req.params.id;

  // Find the correct multiple sequence alignment to act upon
  Fade.findOne({ '_id' : id }, function(err, fade) {

    fade.tagged_nwk_tree = postdata.nwk_tree;
    fade.status          = fade.status_stack[0];

    fade.save(function (err, result) {

      if(err) {
        // Redisplay form with errors
        res.format({
          html: function() {
            res.render('fade/form.ejs', { 'errors': err.errors,
                                            'fade' : fade
                                          });
          },
          json: function() {
            // Save fade analysis
            res.json(200, {'msg': 'Job with fade id ' + id + ' not found'});
          }
        });

      // Successful upload, spawn job
      } else {

        var connect_callback = function(data) {
          if(data == 'connected') {
            logger.log('connected');
          }
        };

        res.json(200,  {'fade' : result});

        Fade.submitJob(result, connect_callback);

      }
    });
  });
};

/**
 * Displays id page for analysis
 * app.get('/fade/:fadeid', fade.getFade);
 */
exports.getPage = function(req, res) {

  // Find the analysis
  // Return its results
  var fadeid = req.params.fadeid;

  //Return all results
  Fade.findOne({_id : fadeid}, function(err, fade) {

    if (err || !fade ) {
      logger.error(err);
      res.json(500, error.errorResponse('Invalid ID : ' + fadeid ));
    } else {

      if(!fade.last_status_msg) {
        fade.last_status_msg = '';
      }

      if(!fade.torque_id) {
        fade.torque_id = '';
      }

      // Should return results page
      //res.json(200, fade);
      res.render('fade/jobpage.ejs', {  
                                         job         : fade, 
                                         socket_addr : 'http://' + setup.host + ':' + setup.socket_port 
                                       });
    }
  });
};

// app.get('/fade/:fadeid/info', fade.getFadeInfo);
exports.getInfo = function(req, res) {

  var fadeid = req.params.fadeid;

  //Return all results
  Fade.findOne({_id : fadeid}, {creation_time: 1, start_time: 1, status: 1}, function(err, fade_info) {
    if (err || !fade_info ) {
      logger.error(err);
      res.json(500, error.errorResponse('Invalid ID : ' + fadeid ));
    } else {
      // Should return results page
      res.json(200, fade_info);
    }
  });
};


/**
 * Displays id page for analysis
 * app.get('/msa/:msaid/fade/:fadeid/results', fade.getFadeResults);
 */
exports.getResults = function(req, res) {

  var fadeid = req.params.fadeid;

  //Return all results
  Fade.findOne({_id : fadeid}, function(err, fade) {
    if (err || !fade ) {
      logger.error(err);
      res.json(500, error.errorResponse('invalid id : ' + fadeid ));
    } else {
      // Should return results page
      res.json(200, { results : fade.results });
    }
  });
};

exports.resubscribePendingJobs = function(req, res) {
  Fade.subscribePendingJobs();
};


/**
 * Returns log txt file 
 * app.get('/fade/:fadeid/results', fade.getFadeResults);
 */
exports.getLog = function(req, res) {

  var fadeid = req.params.fadeid;

  //Return all results
  Fade.findOne({_id : fadeid}, function(err, fade) {
    if (err || !fade ) {
      winston.info(err);
      res.json(500, error.errorResponse('invalid id : ' + fadeid ));
    } else {
      res.set({'Content-Disposition' : 'attachment; filename=\"log.txt\"'});
      res.set({'Content-type' : 'text/plain'});
      res.send(fade.last_status_msg);
    }
  });
};

/**
 * cancels existing job
 * app.get('/fade/:fadeid/cancel', fade.cancel);
 */
exports.cancel = function(req, res) {

  var fadeid = req.params.fadeid;

  //Return all results
  Fade.findOne({_id : fadeid}, function(err, fade) {
    if (err || !fade ) {
      winston.info(err);
      res.json(500, error.errorResponse('invalid id : ' + fadeid ));
    } else {
      fade.cancel(function(err, success) {
        if(success) {
          res.json(200, { success : 'yes' });
        } else {
          res.json(500, { success : 'no' });
        }
      })
    }
  });

};

