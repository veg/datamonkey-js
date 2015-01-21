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

var logger = require(ROOT_PATH + '/lib/logger');

var querystring = require('querystring'),
    error       = require( ROOT_PATH + '/lib/error.js'),
    globals     = require( ROOT_PATH + '/config/globals.js'),
    mailer      = require( ROOT_PATH + '/lib/mailer.js'),
    helpers     = require( ROOT_PATH + '/lib/helpers.js'),
    hpcsocket   = require( ROOT_PATH + '/lib/hpcsocket.js'),
    fs          = require('fs');

var mongoose = require('mongoose'),
    Msa = mongoose.model('Msa'),
    Prime = mongoose.model('Prime');

/**
 * Displays a form
 * app.get('/msa/:msaid/prime', prime.createForm)
 */
exports.createForm = function(req, res) {
  var msaid = req.params.msaid;
  Msa.findOne({_id : msaid}, function (err, uploadfile) {
    if (err || !uploadfile) {
      res.json(500, error.errorResponse('There is no sequence with id of ' + msaid));
    } else {
      var ftc = []
      res.render('prime/form.ejs', { 'uploadfile' : uploadfile});
    }
  });
}

/**
 * Handles a job request by the user
 * app.post('/msa/:msaid/prime', prime.invokePrime);
 */
exports.invokePrime = function(req, res) {

  var prime = new Prime;
  var postdata = req.body;
  var msaid =  req.params.msaid;

  prime.property_choice = Number(postdata.property_choice);
  prime.treemode        = postdata.treemode;
  prime.status          = prime.status_stack[0];

  // Find the correct multiple sequence alignment to act upon
  Msa.findOne({ '_id' : msaid }, function(err, msa) {
    var callback = function(err,result) {
      var num = 0;
      var highest_countid = 1;
      if(err) {
        res.json(500, error.errorResponse(err));
      } else {
        if(result != '' &&  result != null) {
          num = result.id;
        }
        highest_countid = num + 1;
        prime.save(function (err, result) {
          if(err) {
            // Redisplay form with errors
            res.format({
              html: function() {
                res.render('prime/form.ejs', {'errors': err.errors,
                           'uploadfile' : msa});
              },
              json: function() {
                // Save PRIME analysis
                res.json(200, {'msg': 'bad job'});
              }
            });
          // Successful upload, spawn job
          } else {

            // Send the MSA, and type
            var jobproxy = new hpcsocket.HPCSocket({'filepath'    : msa.filepath, 
                                                    'msa'         : msa,
                                                    'analysis'    : result,
                                                    'status_stack': result.status_stack,
                                                    'type'        : 'prime'}, callback);
            function callback(data) {
              if(data == 'connected') {
                res.format({
                  html: function() {
                    res.redirect('msa/' + msa._id + '/prime/' + result._id);
                  },

                  json: function() {
                    // Save PRIME analysis
                    res.json(200, {'msg': 'good job'});
                  }
                });
              }
            }
          }
        });
      }
    }

    //Get count of this analysis
    Prime 
    .findOne({ _id : msa._id })
    .sort('-id')
    .select('id')
    .exec(callback)
  });
}

/**
 * Displays id page for analysis
 * app.get('/msa/:msaid/prime/:primeid', prime.getPrime);
 */
exports.getPrime = function(req, res) {

  // Find the analysis
  // Return its results
  var prime = new Prime;

  var msaid = req.params.msaid,
      primeid = req.params.primeid;


  //Return all results
  Prime.findOne({_id : primeid}, function(err, prime) {
    if (err || !prime ) {
      res.json(500, error.errorResponse('prime not found'));
    } else {
      // Should return results page
      res.render('prime/jobpage.ejs', { job : prime, 
                                                 socket_addr: 'http://' + setup.host + ':' + setup.socket_port 
                                               });
    }
  });

}

/**
 * Displays id page for analysis
 * app.get('/msa/:msaid/prime/:primeid/status', prime.getStatus);
 */
exports.getStatus = function(req, res) {
  // Find the analysis
  // Return its results
  var prime = new Prime;

  var msaid = req.params.msaid,
      primeid = req.params.primeid;

  //Return all results
  Prime.findOne({_id : primeid}, function(err, item) {
    if (err || !item ) {
      res.json(500, error.errorResponse('Item not found'));
    } else {
      logger.log(item);
      res.format({
        html: function() {
          res.render('prime/status.ejs', { 'prime' : item, socket_addr: 'http://' + setup.host + ':' + setup.socket_port});
        },
        json: function() {
          // Save PRIME analysis
          res.json(item.status);
        }
      });
    }
  });
}

/**
 * Deletes analysis
 * app.delete('/msa/:msaid/prime/:primeid', prime.deletePrime);
 */
exports.deletePrime = function(req, res) {
  // Find the analysis
  // Return its results
  var prime = new Prime;

  var msaid = req.params.msaid,
      prime_id = req.params.primeid;

  //Return all results
  Prime.findOneAndRemove({msaid : msaid, id : primeid}, 
                   function(err, item) {
    if (err || !item) {
      res.json(500, error.errorResponse('Item not found: msaid: ' + msaid + ', id : ' + prime_id));
    } else {
      res.json({ "success" : 1 });
    }
  });
}
