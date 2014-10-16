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
    Busted = mongoose.model('Busted');

/**
 * Displays a form
 * app.get('/msa/:msaid/busted', busted.createForm)
 */
exports.createForm = function(req, res) {
  var msaid = req.params.msaid;
  Msa.findOne({_id : msaid}, function (err, uploadfile) {
    if (err || !uploadfile) {
      res.json(500, error.errorResponse('There is no sequence with id of ' + msaid));
    } else {
      var ftc = []
      res.render('analysis/busted/form.ejs', { 'uploadfile' : uploadfile});
    }
  });
}

/**
 * Handles a job request by the user
 * app.post('/msa/:msaid/busted', Busted.invokeBusted);
 */
exports.invokeBusted = function(req, res) {

  var busted = new Busted;
  var postdata = req.body;
  var msaid =  req.params.msaid;

  busted.tagged_nwk_tree = postdata.nwk_tree;
  busted.status          = busted.status_stack[0];

  // Find the correct multiple sequence alignment to act upon
  Msa.findOne({ '_id' : msaid }, function(err, msa) {
    var num = 0;
    var highest_countid = 1;
    highest_countid = num + 1;
    busted.save(function (err, result) {
      if(err) {
        // Redisplay form with errors
        res.format({
          html: function() {
            res.render('analysis/busted/form.ejs', {'errors': err.errors,
                       'uploadfile' : msa});
          },
          json: function() {
            // Save BUSTED analysis
            res.json(200, {'msg': 'Job with sequence alignment id ' + msaid + ' not found'});
          }
        });

      // Successful upload, spawn job
      } else {

        var connect_callback = function(data) {
          if(data == 'connected') {
            console.log('connected');
          }
        }

        res.json(200,  {'busted' : result , 'msa' : msa});
        console.log('creating new socket');
        // Send the MSA and analysis type
        var jobproxy = new hpcsocket.HPCSocket({'filepath'    : msa.filepath, 
                                                'msa'         : msa,
                                                'analysis'    : result,
                                                'status_stack': result.status_stack,
                                                'type'        : 'busted'}, connect_callback);
      }
    });
  });
}

/**
 * Displays id page for analysis
 * app.get('/msa/:msaid/busted/:bustedid', busted.getBusted);
 */
exports.getBusted = function(req, res) {

  // Find the analysis
  // Return its results
  var busted = new Busted;

  var msaid = req.params.msaid,
      bustedid = req.params.bustedid;


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

