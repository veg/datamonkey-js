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
    Busted = mongoose.model('Busted');

exports.createForm = function(req, res) {
  res.render('busted/upload_msa.ejs');
};

exports.uploadFile = function(req, res) {

  var data = req.body;
  var fn = req.files.files.path;

  var busted = new Busted();
  var postdata = req.body;

  var msa = new Msa();

  msa.datatype  = data.datatype;
  msa.gencodeid = data.gencodeid;

  if(postdata.receive_mail == 'true') {
    busted.mail = postdata.mail;
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

    busted.msa = msa;

    busted.save(function (err, busted_result) {
    if(err) {
      logger.error("busted save failed");
      logger.error(err);
      res.json(500, {'error' : err});
      return;
    }

    function move_cb(err, result) {
      if(err) {
        logger.error(err);
        logger.error("busted rename failed");
        res.json(500, {'error' : err});
      } else {
        res.json(200,  busted);
      }
    }
    helpers.moveSafely(req.files.files.path, busted_result.filepath, move_cb);
  });


  });
};

exports.selectForeground = function(req, res) {

  var id = req.params.id;

  Busted.findOne({_id: id}, function (err, busted) {
      res.format({
        html: function() {
          res.render('busted/form.ejs', {'busted' : busted});
        },
        json: function(){
          res.json(200, busted);
        }
      });
  });
};

/**
 * Handles a job request by the user
 * app.post('/msa/:msaid/busted', Busted.invokeBusted);
 */
exports.invokeBusted = function(req, res) {

  var postdata = req.body;
  var id = req.params.id;

  // Find the correct multiple sequence alignment to act upon
  Busted.findOne({ '_id' : id }, function(err, busted) {

    busted.tagged_nwk_tree = postdata.nwk_tree;
    busted.status          = busted.status_stack[0];

    busted.save(function (err, result) {

      if(err) {
        // Redisplay form with errors
        res.format({
          html: function() {
            res.render('busted/form.ejs', { 'errors': err.errors,
                                            'busted' : busted
                                          });
          },
          json: function() {
            // Save BUSTED analysis
            res.json(200, {'msg': 'Job with busted id ' + id + ' not found'});
          }
        });

      // Successful upload, spawn job
      } else {

        var connect_callback = function(data) {
          if(data == 'connected') {
            //TODO
            logger.log('connected');
          }
        };

        res.json(200,  {'busted' : result});

        Busted.submitJob(result, connect_callback);

      }
    });
  });
};

/**
 * Displays id page for analysis
 * app.get('/busted/:bustedid', busted.getBusted);
 */
exports.getBusted = function(req, res) {

  // Find the analysis
  // Return its results
  var bustedid = req.params.bustedid;

  //Return all results
  Busted.findOne({_id : bustedid}, function(err, busted) {

    if (err || !busted ) {
      logger.error(err);
      res.json(500, error.errorResponse('Invalid ID : ' + bustedid ));
    } else {

      if(!busted.last_status_msg) {
        busted.last_status_msg = '';
      }

      if(!busted.torque_id) {
        busted.torque_id = '';
      }

      // Should return results page
      res.render('busted/jobpage.ejs', { job : busted, 
                                                 socket_addr: 'http://' + setup.host + ':' + setup.socket_port 
                                               });
    }
  });
};

/**
 * Displays id page for analysis
 * app.get('/msa/:msaid/busted/:bustedid/results', busted.getBustedResults);
 */
exports.getBustedResults = function(req, res) {

  var bustedid = req.params.bustedid;

  //Return all results
  Busted.findOne({_id : bustedid}, function(err, busted) {
    if (err || !busted ) {
      logger.error(err);
      res.json(500, error.errorResponse('invalid id : ' + bustedid ));
    } else {
      // Should return results page
      res.json(200, { results : busted.results });
    }
  });
};

exports.resubscribePendingJobs = function(req, res) {
  Busted.subscribePendingJobs();
};

