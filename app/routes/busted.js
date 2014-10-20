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
    hpcsocket   = require( ROOT_PATH + '/lib/hpcsocket.js'),
    fs          = require('fs');

var mongoose = require('mongoose'),
    Msa = mongoose.model('Msa'),
    Sequences =  mongoose.model('Sequences'),
    PartitionInfo =  mongoose.model('PartitionInfo'),
    Busted = mongoose.model('Busted');

exports.createForm = function(req, res) {
  res.render('analysis/busted/upload_msa.ejs');
}

exports.uploadFile = function(req, res) {

  var data = req.body;
  var fn = req.files.files.path;

  var busted = new Busted;
  var postdata = req.body;

  var msa = new Msa();

  msa.datatype  = data.datatype;
  msa.gencodeid = data.gencodeid;
  msa.dataReader(fn, function(err, result) {

    if(err) {
      // FASTA validation failed, report an error and the form back to the user
      cb(err, result);
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

    for (i in sequences) {
      var sequences_i = new Sequences(sequences[i]);
      msa.sequence_info.push(sequences_i);
    }

    //Ensure that all information is there
    var partition_info = new PartitionInfo(fpi);
    msa.partition_info = partition_info;

    busted.msa = msa;

    busted.save(function (err, busted_result) {
      if(err) {
        res.json(500, {'msg': err});
      } else {
        fs.rename(req.files.files.path, busted_result.filepath, function(err, result) {
          if(err) {
            res.json(500, {'error' : err.error });
          } else {
            res.json(200, busted);
          }
        });
      }
    });

  });

  //busted.tagged_nwk_tree = postdata.nwk_tree;
  //busted.status          = busted.status_stack[0];


  //res.render('analysis/busted/upload_msa.ejs');
}

exports.selectForeground = function(req, res) {

  var id = req.params.id;

  Busted.findOne({_id: id}, function (err, busted) {
      res.format({
        html: function() {
          res.render('analysis/busted/form.ejs', {'busted' : busted});
        },
        json: function(){
          res.json(200, busted);
        }
      });
  });
}


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
            res.render('analysis/busted/form.ejs', {'errors': err.errors,
                                                    'busted' : busted});
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
            console.log('connected');
          }
        }

        res.json(200,  {'busted' : result});

        // Send the MSA and analysis type
        var jobproxy = new hpcsocket.HPCSocket({'filepath'    : result.filepath, 
                                                'msa'         : result.msa,
                                                'analysis'    : result,
                                                'status_stack': result.status_stack,
                                                'type'        : 'busted'}, connect_callback);
      }
    });
  });
}

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
      res.json(500, error.errorResponse('Invalid ID : ' + bustedid ));
    } else {
      // Should return results page
      res.render('analysis/busted/jobpage.ejs', { job : busted, 
                                                 socket_addr: 'http://' + setup.host + ':' + setup.socket_port 
                                               });
    }
  });
}

/**
 * Displays id page for analysis
 * app.get('/msa/:msaid/busted/:bustedid/results', busted.getBustedResults);
 */
exports.getBustedResults = function(req, res) {

  var bustedid = req.params.bustedid;

  //Return all results
  Busted.findOne({_id : bustedid}, function(err, busted) {
    if (err || !busted ) {
      res.json(500, error.errorResponse('invalid id : ' + bustedid ));
    } else {
      // Should return results page
      res.json(200, { results : busted.results });
    }
  });
}
