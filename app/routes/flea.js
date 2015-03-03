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
    path        = require('path'),
    logger      = require('../../lib/logger');

var mongoose = require('mongoose'),
    Msa = mongoose.model('Msa'),
    Sequences =  mongoose.model('Sequences'),
    PartitionInfo =  mongoose.model('PartitionInfo'),
    Flea = mongoose.model('Flea');

exports.form = function(req, res) {
  res.render('flea/form.ejs');
}

exports.invoke = function(req, res) {

  var postdata  = req.body;

  var msas = [];
  var flea_files = postdata.flea_files;
  var flea_tmp_dir = __dirname + '/../../uploads/flea/tmp/';
  var flea_files = JSON.parse(flea_files);
  var datatype  = 0;
  var gencodeid = 1;

  var populateFilename = function(obj) {

    return { 'fn'            : flea_tmp_dir + obj.fn, 
             'last_modified' : obj.last_modified,
             'visit_code'    : obj.visit_code,
             'visit_date'    : obj.visit_date
           };
  }

  flea_files = flea_files.map(populateFilename);

  if(postdata.receive_mail == 'true') {
    flea.mail = postdata.mail;
  }

  var connect_callback = function (err, result) {
    logger.log(result);
  }


  // Loop through each file upload
  flea_files.forEach(function(flea_file) {

    Msa.parseFile(flea_file.fn, datatype, gencodeid, function(err, msa) {

      if(err) {
        // remove all files from tmp directory and start over
        res.render('flea/form.ejs');
      } else {
        msa.visit_code = flea_file.visit_code;
        msa.visit_date = flea_file.visit_date;
        msa.original_filename = path.basename(flea_file.fn);
        msas.push(msa);
      }

      if(msas.length == flea_files.length) {
        var flea = new Flea;
        flea.msas = msas;

        flea.save(function (err, flea_result) {

            if(err) {
              logger.error("flea save failed");
              logger.error(err);
              res.json(500, {'error' : err});
              return;
            }

            function respond_with_json(err, result) {

              if(err) {
                logger.error(err);
                logger.error("flea rename failed");
                res.json(500, {'error' : err});
              } else {

                res.json(200,  {'flea' : flea } );

                // Send the MSA and analysis type
                // Package msas to send
                Flea.pack(flea_result);

                var jobproxy = new hpcsocket.HPCSocket({'filepath'    : flea_result.filepath, 
                                                        'msas'        : flea_result.msas,
                                                        'analysis'    : flea_result,
                                                        'status_stack': flea_result.status_stack,
                                                        'type'        : 'flea'}, connect_callback);

              }
            }

            // wait until all files have been moved before sending json response
            var count = 1;
            var was_error = false;

            var move_cb = function(err, result) {
              count = count + 1;
              if(err) {
                was_error = true;
              } else {
                if(count == flea_files.length) {
                  if(err) {
                    respond_with_json('failure', '');
                  } else {
                    respond_with_json('', true);
                  }
                }
              }
            }

            msas.forEach(function (flea_file) {
              var current_location =  flea_tmp_dir + flea_file.original_filename;
              var final_dest =  flea_result.filedir + flea_file._id + '.fastq';
              helpers.moveSafely(current_location, final_dest, move_cb);
            });

          });
        }
      });
    });

}

/**
 * Displays id page for analysis
 * app.get('/flea/:id', flea.getFlea);
 */
exports.getPage = function(req, res) {

  // Find the analysis
  // Return its results
  var fleaid = req.params.id;

  //Return all results
  Flea.findOne({_id : fleaid}, function(err, flea) {
    if (err || !flea ) {
      logger.error(err);
      res.json(500, error.errorResponse('Invalid ID : ' + fleaid ));
    } else {
      // Should return results page
      res.render('flea/jobpage.ejs', { job : flea, 
                                                 socket_addr: 'http://' + setup.host + ':' + setup.socket_port 
                                               });
    }
  });
}

/**
 * Displays id page for analysis
 */
exports.getResults = function(req, res) {

  var fleaid = req.params.id;

  //Return all results
  Flea.findOne({_id : fleaid}, function(err, flea) {
    if (err || !flea ) {
      logger.error(err);
      res.json(500, error.errorResponse('invalid id : ' + fleaid ));
    } else {
      // Should return results page
      res.json(200, JSON.parse(flea.results));
    }
  });

}

/**
 * Displays id page for analysis
 */
exports.getRates = function(req, res) {

  var fleaid = req.params.id;

  //Return all results
  Flea.findOne({_id : fleaid}, function(err, flea) {
    if (err || !flea ) {
      logger.error(err);
      res.json(500, error.errorResponse('invalid id : ' + fleaid ));
    } else {
      // Should return results page
      res.json(200, JSON.parse(flea.frequencies));
    }
  });

}

/**
 * Displays id page for analysis
 */
exports.getFrequencies = function(req, res) {

  var fleaid = req.params.id;

  //Return all results
  Flea.findOne({_id : fleaid}, function(err, flea) {
    if (err || !flea ) {
      logger.error(err);
      res.json(500, error.errorResponse('invalid id : ' + fleaid ));
    } else {
      // Should return results page
      res.json(200, JSON.parse(flea.frequencies));
    }
  });

}

exports.getTrajectory = function(req, res) {

  var fleaid = req.params.id;

  //Return all results
  Flea.findOne({_id : fleaid}, function(err, flea) {
    if (err || !flea ) {
      logger.error(err);
      res.json(500, error.errorResponse('invalid id : ' + fleaid ));
    } else {
      // Should return results page
      res.json(200, JSON.parse(flea.trajectory));
    }
  });

}

/**
 * Displays id page for analysis
 */
exports.getGenes = function(req, res) {

  var fleaid = req.params.id;

  //Return all results
  Flea.findOne({_id : fleaid}, function(err, flea) {
    if (err || !flea ) {
      logger.error(err);
      res.json(500, error.errorResponse('invalid id : ' + fleaid ));
    } else {
      // Should return results page
      res.json(200, JSON.parse(flea.gene));
    }
  });

}

exports.getTrees = function(req, res) {

  var fleaid = req.params.id;

  //Return all results
  Flea.findOne({_id : fleaid}, function(err, flea) {
    if (err || !flea ) {
      logger.error(err);
      res.json(500, error.errorResponse('invalid id : ' + fleaid ));
    } else {
      // Should return results page
      res.json(200, JSON.parse(flea.trees));
    }
  });

}

exports.getNeutralization = function(req, res) {

  var fleaid = req.params.id;

  //Return all results
  Flea.findOne({_id : fleaid}, function(err, flea) {
    if (err || !flea ) {
      logger.error(err);
      res.json(500, error.errorResponse('invalid id : ' + fleaid ));
    } else {
      // Should return results page
      res.json(200, JSON.parse(flea.neutralization));
    }
  });

}
