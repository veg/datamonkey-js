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

var querystring = require('querystring');
var dpl         = require('../../lib/datamonkey-pl.js');
var dme         = require('../../lib/datamonkey-event.js');
var error       = require('../../lib/error.js');
var globals     = require('../../config/globals.js');
var mailer      = require('../../lib/mailer.js');
var helpers     = require('../../lib/helpers.js');
var fs          = require('fs');

var mongoose = require('mongoose'),
    Msa = mongoose.model('Msa');


// TODO: Put in Model
function createAnalysis(Analysis, AnalysisParameters, msa, count, type,
                        postdata, res) {

  var an = new Analysis({
    msafn  : msa._id,
    msaid  : msa.msaid,
    id     : count,
    type   : type,
    status : globals.queue,
  });

  // TODO: Change to verify function
  if (postdata.sendmail !== undefined) {
    an.sendmail = postdata.sendmail;
  }

  an.save(function (err, result) {

    if (err) {
      console.log(err);
    }

    // Create Analysis Parameters from postdata
    var parameters = new AnalysisParameters(),
      missing_params = [];

    // Verify parameters
    // TODO: Just search required
    for (var parameter in parameters.schema.tree) {
      if (parameter != "_id" && parameter != "id") { 
        if (parameter in postdata) {
         parameters[parameter] = postdata[parameter] ;
        }
        else {
          missing_params.push(parameter);
        }
      }
    }

    if (missing_params.length > 0){
      res.json(500, error.errorResponse("Missing Parameters: " + missing_params));
      return;
    }

    //Save Parameters to parent object
    parameters.save(function (err, aparams) {
      if (err) {
        console.log(err);
      }

      else {

        // Open Multiple Sequence Alignment File to get all necessary parameters
        // for dispatching.
        if (err) {
          res.json(500, error.errorResponse('There is no sequence with id of '
                                       + id));
        } else {
          an.parameters.push(parameters);
          an.save();

          // If not part of the model, then grab the constant
           var params = {
              'method'                : globals[type].id,
              'treeMode'              : aparams.treemode || globals[type].treemode,
              'prime_property_choice' : aparams.prime_property_choice || globals[type].treemode,
              'root'                  : aparams.root || globals[type].root,
              'modelstring'           : aparams.modelstring || globals[type].modelstring,
              'namedmodels'           : aparams.namedmodels || globals[type].namedmodels,
              'roptions'              : aparams.roptions || globals[type].roptions,
              'dnds'                  : aparams.dnds || globals[type].dnds,
              'ambchoice'             : aparams.ambchoice || globals[type].ambchoice,
              'pvalue'                : aparams.pvalue || globals[type].pvalue,
              'rateoption'            : aparams.rateoption || globals[type].rateoption,
              'rateclasses'           : aparams.rateclasses || globals[type].rateclasses,
              'rateoption2'           : aparams.rateoption2 || globals[type].rateoption2,
              'rateclasses2'          : aparams.rateclasses2 || globals[type].rateclasses2
           };

           // Dispatch the analysis to the perl script
           dpl.dispatchAnalysis(an, type, msa, params, res);
         }
      }
    });
  });
}

exports.invokeJob = function(req, res) {

  //TODO: Validate parameters
  var type =  req.params.type;

  var Analysis = mongoose.model(type.capitalize());
  var AnalysisParameters = mongoose.model(type.capitalize() + 'Parameters');

  //Create Analysis of respective type
  var postdata = req.query;
  var msaid =  postdata.msaid;

  Msa.findOne({msaid : msaid}, function(err, msa) {

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

      createAnalysis(Analysis, AnalysisParameters, msa, highest_countid, type,
                     postdata, res);

    }

    //Get count of this analysis
    Analysis 
    .findOne({ msafn: msa._id })
    .sort('-id')
    .select('id')
    .exec(callback)

  });

// I want to post all analyses to here, 
// based on what the type is, create
// the correct type of object.

}

exports.queryStatus = function(req, res) {
  // Find the analysis
  // Return its status

  //TODO: Validate parameters
  var type =  req.params.type;
  var Analysis = mongoose.model(type.capitalize());
  
  Msa.findOne({msaid : req.params.msaid}, function(err, msa) {
      if (err || !msa ) {
        res.json(500, error.errorResponse('There is no sequence with id of ' + 
                                      req.params.analysisid));
      } else { 
      Analysis.findOne({msafn : msa._id, id : req.params.analysisid}, function(err, item) {
        if (err)
          res.json(500, error.errorResponse('There is no sequence with id of ' 
                   + req.params.analysisid));
        else {
          //This should eventually be its own polling task
          res.json({"status":item.status});
        }
      });
    }
  });
}

exports.getAnalysis = function(req, res) {
  // Find the analysis
  // Return its results
  var type =  req.params.type,
    Analysis = mongoose.model(type.capitalize());

  var msaid = req.params.msaid,
      analysisid = req.params.analysisid;


  //Return all results
  Analysis.findOne({msaid : msaid, id : analysisid}, function(err, item) {
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

  var msaid = req.params.msaid,
      analysisid = req.params.analysisid;

  //Return all results
  Analysis.findOneAndRemove({msaid : msaid, id : analysisid}, 
                   function(err, item) {
    if (err || !item) {
      res.json(500, error.errorResponse('Item not found: msaid: ' + msaid + ', id : ' + analysisid));
    } else {
      res.json({"success" : 1});
    }
  });
}

