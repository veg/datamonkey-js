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
    dpl         = require( ROOT_PATH + '/lib/datamonkey-pl.js'),
    dme         = require( ROOT_PATH + '/lib/datamonkey-event.js'),
    error       = require( ROOT_PATH + '/lib/error.js'),
    globals     = require( ROOT_PATH + '/config/globals.js'),
    mailer      = require( ROOT_PATH + '/lib/mailer.js'),
    helpers     = require( ROOT_PATH + '/lib/helpers.js'),
    fs          = require('fs');

var mongoose = require('mongoose'),
    Msa = mongoose.model('Msa');

function createAnalysis(Analysis, msa, count, type,
                        postdata, callback) {

  var an = new Analysis({
    upload_id : msa._id,
    id        : count,
    type      : type,
    status    : globals.queue,
  });

  if (postdata.sendmail !== undefined) {
    an.sendmail = postdata.sendmail;
  } else {
    an.sendmail = true;
  }

  // Verify parameters
  // TODO: Just search required
  for (var parameter in an.schema.tree) {
    if (parameter != "_id" && parameter != "id") { 
      if (parameter in postdata) {
       parameters[parameter] = postdata[parameter] ;
      } else {
        if(parameter != "__v") {
          missing_params.push(parameter);
        }
      }
    }
  }

  an.save(function (err, result) {

    if (err) {
      helpers.logger.warn(err);
      callback("Missing Parameters: " + missing_params, null);
      return;
    }
  
    // If not part of the model, then grab the constant
     var params = {
        'method'                : globals[type].id,
        'treeMode'              : result.treemode || globals[type].treemode,
        'prime_property_choice' : result.prime_property_choice || globals[type].treemode,
        'root'                  : result.root || globals[type].root,
        'modelstring'           : result.modelstring || globals[type].modelstring,
        'namedmodels'           : result.namedmodels || globals[type].namedmodels,
        'roptions'              : result.roptions || globals[type].roptions,
        'dnds'                  : result.dnds || globals[type].dnds,
        'ambchoice'             : result.ambchoice || globals[type].ambchoice,
        'pvalue'                : result.pvalue || globals[type].pvalue,
        'rateoption'            : result.rateoption || globals[type].rateoption,
        'rateclasses'           : result.rateclasses || globals[type].rateclasses,
        'rateoption2'           : result.rateoption2 || globals[type].rateoption2,
        'rateclasses2'          : result.rateclasses2 || globals[type].rateclasses2
     };

     // Dispatch the analysis to the perl script
    dpl.dispatchAnalysis(an, type, msa, params, function(err, analysis) {
      if (err) {
        callback(err, null);  
      } else {
        callback(null, analysis);  
      }
    });
  });
}

exports.invokeJob = function(req, res) {

  //TODO: Validate parameters
  var type =  req.params.type;

  var Analysis = mongoose.model(type.capitalize());

  //Create Analysis of respective type
  var postdata = req.query;
  var upload_id =  postdata.upload_id;

  Msa.findOne({ 'upload_id' : upload_id }, function(err, msa) {

    var callback = function(err,result) {
      var num = 0;
      var highest_countid = 1;

      if(err) {
        res.json(500, error.errorResponse(err));
      }

      if(result != '' && result != null) {
        num = result.id;
        highest_countid = result.id + 1;
      }

      createAnalysis(Analysis, msa, highest_countid, type,
                     postdata, function(err, message) {
        if (err) {
          res.json(500, error.errorResponse(err));
        } else {
          res.json(200, message);
        }
      });
    }

    //Get count of this analysis
    Analysis 
    .findOne({ upload_id : msa._id })
    .sort('-id')
    .select('id')
    .exec(callback)

  });

}

exports.createForm = function(req, res) {
  var upload_id = req.params.upload_id;
  var get_type = req.query.type || "";

  Msa.findOne({upload_id : upload_id}, function (err, uploadfile) {
    if (err || !uploadfile) {
      res.json(500, error.errorResponse('There is no sequence with id of ' + id));
    } else {
      var ftc = []
      res.render('analysis/create.ejs', { 'uploadfile' : uploadfile , 
                                          'get_type'   : get_type,
                                          'analysis_types' : globals.types });
    }
  });
}

exports.queryStatus = function(req, res) {
  // Find the analysis
  // Return its status

  //TODO: Validate parameters
  var type  =  req.params.type;
  var upload_id =  req.params.upload_id;
  var Analysis = mongoose.model(type.capitalize());
  
  Analysis.findOne({upload_id : upload_id, id : req.params.analysisid}, 
                   function(err, item) {
    if (err) {
      res.json(500, error.errorResponse('There is no sequence with id of ' 
               + req.params.analysisid));
    } else {
      //This should eventually be its own polling task
      res.json({"status":item.status});
    }
  });
}

exports.getAnalysis = function(req, res) {
  // Find the analysis
  // Return its results
  var type =  req.params.type,
    Analysis = mongoose.model(type.capitalize());

  var upload_id = req.params.upload_id,
      analysisid = req.params.analysisid;

  //Return all results
  Analysis.findOne({upload_id : upload_id, id : analysisid}, function(err, item) {
    if (err || !item ) {
      res.json(500, error.errorResponse('Item not found'));
    } else {
      res.json(item);
    }
  });
}

exports.deleteAnalysis = function(req, res) {
  // Find the analysis
  // Return its results
  var type =  req.params.type,
    Analysis = mongoose.model(type.capitalize());

  var upload_id = req.params.upload_id,
      analysisid = req.params.analysisid;

  //Return all results
  Analysis.findOneAndRemove({upload_id : upload_id, id : analysisid}, 
                   function(err, item) {
    if (err || !item) {
      res.json(500, error.errorResponse('Item not found: upload_id: ' + upload_id + ', id : ' + analysisid));
    } else {
      res.json({"success" : 1});
    }
  });
}

