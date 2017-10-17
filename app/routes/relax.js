/*jslint node: true */

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
};

exports.uploadFile = function(req, res) {

  var fn = req.files.files.file,
      relax = new Relax(),
      postdata  = req.body,
      datatype  = 0,
      gencodeid = postdata.gencodeid;

  if(postdata.receive_mail == 'true') {
    relax.mail = postdata.mail;
  }
  relax.analysis_type = postdata.analysis_type;
  Msa.parseFile(fn, datatype, gencodeid, function(err, msa) {


    if(err) {
      res.json(500, {'error' : err});
      return;
    }

    // Check if msa exceeds limitations
    if(msa.sites > relax.max_sites) {
      var error = 'Site limit exceeded! Sites must be less than ' + relax.max_sites;
      logger.error(error);
      res.json(500, {'error' : error });
      return;
    }

    if(msa.sequences > relax.max_sequences) {
      var error = 'Sequence limit exceeded! Sequences must be less than ' + relax.max_sequences;
      logger.error(error);
      res.json(500, {'error' : error});
      return;
    }

    relax.msa = msa;

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

      helpers.moveSafely(req.files.files.file, relax_result.filepath, move_cb);

    });
  });
};

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
};

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
            logger.log('connected');
          }
        };

        res.json(200,  {'relax' : result});
        Relax.submitJob(result, connect_callback);

      }
    });
  });
};

/**
 * Displays id page for analysis
 * app.get('/relax/:relaxid', relax.getRelax);
 */
exports.getPage = function(req, res) {

  // Find the analysis
  // Return its results
  var relaxid = req.params.id;

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
      res.render('relax/jobpage.ejs', { job : relax });
    }
  });
};

/**
 * Displays id page for analysis
 * app.get('/msa/:msaid/relax/:relaxid/results', relax.getRelaxResults);
 */
exports.getResults = function(req, res) {

  var relaxid = req.params.id;

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
      relax_results['input_data'] = relax.input_data;
      res.json(200, relax_results);

    }
  });
};

/**
 * Handles a job request by the user
 * app.post('/msa/:msaid/relax', Relax.invokeRelax);
 */
exports.restart = function(req, res) {

  var id = req.params.id;

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
          logger.log('connected');
        }
      };

      res.json(200,  {'relax' : result});
      Relax.submitJob(result, connect_callback);

    }
  });
};

/*
 * Displays id page for analysis
 * app.get('/relax/:relaxid', relax.getRelax);
 */
exports.getRecheck = function(req, res) {

  var relaxid = req.params.id;

  Relax.findOne({_id : relaxid}, function(err, relax) {
    if (err || !relax ) {
      logger.error(err);
      res.json(500, error.errorResponse('Invalid ID : ' + relaxid ));
    } else {

        var callback = function(data) {
          res.json(200,  data);
        };

      Relax.submitJob(result, callback);

    }

  });
};

// app.get('/relax/:id/info', relax.getInfo);
exports.getInfo = function(req, res) {

  var id = req.params.id;

  //Return all results
  Relax.findOne({_id : id}, {creation_time: 1, start_time: 1, status: 1}, function(err, relax_info) {
    if (err || !relax_info ) {
      logger.error(err);
      res.json(500, error.errorResponse('Invalid ID : ' + id));
    } else {
      // Should return results page
      res.json(200, relax_info);
    }
  });
};

/**
 * Returns log txt file 
 * app.get('/relax/:id/log.txt', relax.getLog);
 */
exports.getLog = function(req, res) {

  var id = req.params.id;

  //Return all results
  Relax.findOne({_id : id}, function(err, relax) {
    if (err || !busted ) {
      winston.info(err);
      res.json(500, error.errorResponse('invalid id : ' + id));
    } else {
      res.set({'Content-Disposition' : 'attachment; filename=\"log.txt\"'});
      res.set({'Content-type' : 'text/plain'});
      res.send(relax.last_status_msg);
    }
  });
};

/**
 * cancels existing job
 * app.get('/relax/:id/cancel', relax.cancel);
 */
exports.cancel = function(req, res) {

  var id = req.params.id;

  //Return all results
  Relax.findOne({_id : id}, function(err, relax) {
    if (err || !relax) {
      winston.info(err);
      res.json(500, error.errorResponse('invalid id : ' + id));
    } else {
      relax.cancel(function(err, success) {
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
  Relax.subscribePendingJobs();
};

exports.getUsage = function(req, res){
  Relax.usageStatistics(function(err, relax){
    res.json(200, relax);
  });
};
