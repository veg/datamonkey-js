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
    GARD = mongoose.model('GARD');

exports.form = function(req, res) {

  var post_to = '/gard';
  res.render('gard/form.ejs', {'post_to' : post_to} );

};

exports.invoke = function(req, res) {

  var connect_callback = function(data) {

    if(data == 'connected') {
      logger.log('connected');
    }

  };

  var fn = req.files.files.file,
      gard = new GARD(),
      postdata  = req.body,
      datatype  = postdata.datatype,
      gencodeid = postdata.gencodeid,
      site_to_site_variation = postdata.site_to_site_variation,
      rate_classes = postdata.rate_classes;

  gard.site_to_site_variation = site_to_site_variation;
  gard.rate_classes = rate_classes;

  if(postdata.receive_mail == 'true') {
    gard.mail = postdata.mail;
  }

  Msa.parseFile(fn, datatype, gencodeid, function(err, msa) {

    if(err) {
      res.json(500, {'error' : err});
      return;
    }

    // Check if msa exceeds limitations
    if(msa.sites > gard.max_sites) {
      var error = 'Site limit exceeded! Sites must be less than ' + gard.max_sites;
      logger.error(error);
      res.json(500, {'error' : error });
      return;
    }

    if(msa.sequences > gard.max_sequences) {
      var error = 'Sequence limit exceeded! Sequences must be less than ' + gard.max_sequences;
      logger.error(error);
      res.json(500, {'error' : error});
      return;
    }

    gard.msa = msa;

    gard.status = gard.status_stack[0];

    gard.save(function (err, gard_result) {

      if(err) {
        logger.error("gard save failed");
        logger.error(err);
        res.json(500, {'error' : err});
        return;
      }

      function move_cb(err, result) {
        if(err) {
          logger.error(err);
          logger.error("gard rename failed");
          res.json(500, {'error' : err});
        } else {
          var to_send = gard;
          to_send.upload_redirect_path =  gard.upload_redirect_path;
          res.json(200,  { "analysis" : gard, 
                           "upload_redirect_path": gard.upload_redirect_path});

          // Send the MSA and analysis type
          GARD.submitJob(gard_result, connect_callback);

        }
      }

      helpers.moveSafely(req.files.files.file, gard_result.filepath, move_cb);

    });

  });

};

exports.getPage = function(req, res) {

  // Find the analysis
  var gardid = req.params.id;

  //Return all results
  GARD.findOne({_id : gardid}, function(err, gard) {

    if (err || !gard ) {
      logger.error(err);
      res.json(500, error.errorResponse('Invalid ID : ' + gardid ));
    } else {
      // Should return results page
      res.render('gard/jobpage.ejs', { job : gard });
    }
  });

};

exports.getResults = function(req, res) {

  var gardid = req.params.id;
  GARD.findOne({_id : gardid}, function(err, gard) {
    if (err || !gard ) {
      logger.error(err);
      res.json(500, error.errorResponse('invalid id : ' + gardid ));
    } else {
      // Should return results page
      // Append PMID to results
      var gard_results =  JSON.parse(gard.results);
      gard_results['PMID'] = gard.pmid;
      res.json(200, gard_results);
    }
  });

};

// app.get('/gard/:id/info', gard.getInfo);
exports.getInfo = function(req, res) {

  var id = req.params.id;

  //Return all results
  GARD.findOne({_id : id}, {creation_time: 1, start_time: 1, status: 1}, function(err, gard_info) {
    if (err || !gard_info) {
      logger.error(err);
      res.json(500, error.errorResponse('Invalid ID : ' + id));
    } else {
      // Should return results page
      res.json(200, gard_info);
    }
  });
};

/**
 * Returns log txt file 
 * app.get('/gard/:id/results', gard.getLog);
 */
exports.getLog = function(req, res) {

  var id = req.params.id;

  //Return all results
  GARD.findOne({_id : id}, function(err, gard) {
    if (err || !busted ) {
      winston.info(err);
      res.json(500, error.errorResponse('invalid id : ' + id));
    } else {
      res.set({'Content-Disposition' : 'attachment; filename=\"log.txt\"'});
      res.set({'Content-type' : 'text/plain'});
      res.send(gard.last_status_msg);
    }
  });
};

/**
 * cancels existing job
 * app.get('/busted/:id/cancel', gard.cancel);
 */
exports.cancel = function(req, res) {

  var id = req.params.id;

  //Return all results
  GARD.findOne({_id : id}, function(err, gard) {
    if (err || !busted ) {
      winston.info(err);
      res.json(500, error.errorResponse('invalid id : ' + id));
    } else {
      gard.cancel(function(err, success) {
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
  GARD.subscribePendingJobs();
};

