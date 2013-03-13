var querystring = require('querystring');
var dpl         = require('../../lib/datamonkey-pl.js');
var dme         = require('../../lib/datamonkey-event.js');
var globals     = require('../../config/globals.js');
var mailer      = require('../../lib/mailer.js');
var helpers     = require('../../lib/helpers.js');
var fs          = require('fs');

var mongoose = require('mongoose')
  , Msa = mongoose.model('Msa');

//return all sequences
exports.findAll = function(req, res) {
  type =  req.params.type;

  //I need to query find based on type
  var Analysis = mongoose.model(type.capitalize());

  Analysis.find({},function(err, items) {
    if (err)
      res.send('There is no sequence with id of ' + id);
    else
      res.send(items);
  });

};

exports.invokeJob = function(req, res) {
  type =  req.params.type;

  var Analysis = mongoose.model(type.capitalize());
  var AnalysisParameters = mongoose.model(type.capitalize() + 'Parameters');

  //Create Analysis of respective type
  var postdata = req.query;
  var msaid =  postdata.msaid;


  Msa.findOne({msaid : msaid}, function(err, msa) {
    console.log(msa);

    //TODO: Start status as "initializing"
    var analysis = new Analysis ({
      msafn  : msa._id,
      status : globals.queue,
    });

    //TODO: Change to verify function
    if (postdata.sendmail !== undefined) {
      analysis.sendmail = postdata.sendmail;
    }

    analysis.save(function (err,result) {

      if (err)
        console.log(err);

      //Create Analysis Parameters from postdata
      //TODO: Verify parameters before committing them
      var parameters = new AnalysisParameters({
        modelstring : postdata.modelstring,
        treemode    : postdata.treemode,
        pvalue      : postdata.pvalue,
      });

      //Save Meme Parameters to parent Meme object
      parameters.save(function (err, aparams) {
        if (err)
          console.log(err);

        else {

          // Open Multiple Sequence Alignment File to get all necessary parameters
          // for dispatching.
          if (err)
            res.send('There is no sequence with id of ' + id);

           else {

            //TODO: If not part of the model, then grab the constant
             var params = {
                'method'        : globals[type],
                'treeMode'      : aparams.treemode || globals[type].treemode,
                'root'          : aparams.root || globals[type].root,
                'modelstring'   : aparams.modelstring || globals[type].modelstring,
                'namedmodels'   : aparams.namedmodels || globals[type].namedmodels,
                'roptions'      : aparams.roptions || globals[type].roptions,
                'dnds'          : aparams.dnds || globals[type].dnds,
                'ambchoice'     : aparams.ambchoice || globals[type].ambchoice,
                'pvalue'        : aparams.pvalue || globals[type].pvalue,
                'rateoption'    : aparams.rateoption || globals[type].rateoption,
                'rateclasses'   : aparams.rateclasses || globals[type].rateclasses,
                'rateoption2'   : aparams.rateoption2 || globals[type].rateoption2,
                'rateclasses2'  : aparams.rateclasses2 || globals[type].rateclasses2
             };

             //Dispatch the analysis to the perl script
             dpl.dispatchAnalysis(analysis.id,type,msa,params,res);

             // TODO: We should return the status id ticket here instead of
             // inside dispatchAnalysis
           }
        }

        analysis.parameters.push(parameters);
        analysis.save();

      });
    });
  });
// I want to post all analyses to here, 
// based on what the type is, create
// the correct type of object.

}

exports.queryStatus = function(req, res) {
  // Find the analysis
  // Return its status
  var Analysis = mongoose.model(type.capitalize());


  Analysis.findOne({id : req.params.analysisid}, function(err, item) {
    if (err)
      res.send('There is no sequence with id of ' + req.params.analysisid);

    else {
      //This should eventually be its own polling task
      res.send({status:item.status});
    }
  });

}

exports.getResults = function(req, res) {
  // Find the analysis
  // Return its results

  type =  req.params.type;
  var Analysis = mongoose.model(type.capitalize());

  //Return all results
  Analysis.findOne({id : req.params.analysisid}, function(err, item) {

    if (err)
      res.send('There is no sequence with id of ' + id);

    else
    {

      if(item.status == globals.cancelled || item.status == globals.finished)
      {

        if(item.results)
          res.send(item.results);

        else
          res.send('Something wrong happened with this job');

      }
    }
    res.send('Job still running!');
  });

}

//Dev purposes only
exports.sendMail = function(req, res) {

  type =  req.params.type;

  mailer.send();  
  res.send({response:'Mail Sent!'});

}

//Dev purposes only
exports.parseResults = function(req, res) {

  type =  req.params.type;
  console.log(req.params.type);
  console.log(req.params.analysisid);

  var Analysis = mongoose.model(type.capitalize());

  Analysis.findOne({id : req.params.analysisid}, function(err, item) {
    if (err)
      res.send('There is no sequence with id of ' + req.params.analysisid);

    else {

      //This should eventually be its own polling task
      dpl.parseResults(item);
      res.send({status:item.msafn});

    }

  });

}

