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
    logger      = require('../../lib/logger');

var mongoose = require('mongoose'),
    Msa = mongoose.model('Msa'),
    Sequences =  mongoose.model('Sequences'),
    PartitionInfo =  mongoose.model('PartitionInfo'),
    aBSREL = mongoose.model('aBSREL');

exports.form = function(req, res) {
  var post_to = '/absrel';
  res.render('absrel/form.ejs', {'post_to' : post_to} );
};

exports.invoke = function(req, res) {

  var connect_callback = function(data) {

    if(data == 'connected') {
      logger.log('connected');
    }

  };

  var fn = req.files.files.path;
  var postdata  = req.body;
  var datatype  = postdata.datatype;
  var gencodeid = postdata.gencodeid;

  if(postdata.receive_mail == 'true') {
    absrel.mail = postdata.mail;
  }

  Msa.parseFile(fn, datatype, gencodeid, function(err, msa) {

    var absrel = new aBSREL();

    absrel.msa = msa;
    absrel.status = absrel.status_stack[0];

    if(err) {
      res.json(500, {'error' : err});
      return;
    }

    absrel.save(function (err, absrel_result) {

      if(err) {
        logger.error("absrel save failed");
        logger.error(err);
        res.json(500, {'error' : err});
        return;
      }

      function move_cb(err, result) {
        if(err) {
          logger.error(err);
          logger.error("absrel rename failed");
          res.json(500, {'error' : err});
        } else {
          var to_send = absrel;
          to_send.upload_redirect_path =  absrel.upload_redirect_path;
          res.json(200,  { "analysis" : absrel, 
                           "upload_redirect_path": absrel.upload_redirect_path});

          // Send the MSA and analysis type
          aBSREL.submitJob(absrel_result, connect_callback);

        }
      }

      helpers.moveSafely(req.files.files.path, absrel_result.filepath, move_cb);

    });

  });

};

exports.getPage = function(req, res) {

  // Find the analysis
  var absrelid = req.params.id;

  //Return all results
  aBSREL.findOne({_id : absrelid}, function(err, absrel) {

    if (err || !absrel ) {
      logger.error(err);
      res.json(500, error.errorResponse('Invalid ID : ' + absrelid ));
    } else {
      // Should return results page
      res.render('absrel/jobpage.ejs', { job : absrel });
    }
  });

};

exports.getResults = function(req, res) {

  var absrelid = req.params.id;
  aBSREL.findOne({_id : absrelid}, function(err, absrel) {
    if (err || !absrel ) {
      logger.error(err);
      res.json(500, error.errorResponse('invalid id : ' + absrelid ));
    } else {
      // Should return results page
      // Append PMID to results
      var absrel_results =  JSON.parse(absrel.results);
      absrel_results['PMID'] = absrel.pmid;
      res.json(200, absrel_results);
    }
  });

};

// app.get('/absrel/:id/info', absrel.getInfo);
exports.getInfo = function(req, res) {

  var id = req.params.id;

  //Return all results
  aBSREL.findOne({_id : id}, {creation_time: 1, start_time: 1, status: 1}, function(err, absrel_info) {
    if (err || !absrel_info) {
      logger.error(err);
      res.json(500, error.errorResponse('Invalid ID : ' + id));
    } else {
      // Should return results page
      res.json(200, absrel_info);
    }
  });
};

/**
 * Returns log txt file 
 * app.get('/absrel/:id/results', absrel.getLog);
 */
exports.getLog = function(req, res) {

  var id = req.params.id;

  //Return all results
  aBSREL.findOne({_id : id}, function(err, absrel) {
    if (err || !busted ) {
      winston.info(err);
      res.json(500, error.errorResponse('invalid id : ' + id));
    } else {
      res.set({'Content-Disposition' : 'attachment; filename=\"log.txt\"'});
      res.set({'Content-type' : 'text/plain'});
      res.send(absrel.last_status_msg);
    }
  });
};

/**
 * cancels existing job
 * app.get('/busted/:id/cancel', absrel.cancel);
 */
exports.cancel = function(req, res) {

  var id = req.params.id;

  //Return all results
  aBSREL.findOne({_id : id}, function(err, absrel) {
    if (err || !busted ) {
      winston.info(err);
      res.json(500, error.errorResponse('invalid id : ' + id));
    } else {
      absrel.cancel(function(err, success) {
        if(success) {
          res.json(200, { success : 'yes' });
        } else {
          res.json(500, { success : 'no' });
        }
      })
    }
  });

};

exports.resubscribePendingJobs = function(req, res) {
  aBSREL.subscribePendingJobs();
};
