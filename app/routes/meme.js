var querystring = require('querystring');

var dpl     = require('../../lib/datamonkey-pl.js');
var dme     = require('../../lib/datamonkey-event.js');
var globals = require('../../config/globals.js');
var mailer  = require('../../lib/mailer.js');

var fs = require('fs');

var mongoose              = require('mongoose')
  , Msa = mongoose.model('Msa')
  , Meme                  = mongoose.model('Meme')
  , MemeParameters        = mongoose.model('MemeParameters');

var meme_consts = {
  //TODO:Root has to be dynamically chosen
  root          : "SRC1",
  roptions      : 4,
  dnds          : 1.0,
  ambchoice     : 0,
  rateoption    : 0,
  rateclasses   : 2,
  rateoption2   : 1,
  rateclasses2  : 2
};

//return all sequences
exports.findAll = function(req, res) {
  Meme.find({},function(err, items) {
    if (err)
      res.send('There is no sequence with id of ' + id);
    else
      res.send(items);
  });
};

//Start a Meme Analysis
exports.invokeMemeJob = function(req, res) {

  var postdata = req.query;
  var seqid =  postdata.seqid;

  //Create Meme Analysis
  //TODO: Start status as "initializing"
  var meme = new Meme({
    msafn  : seqid,
    status : globals.queue,
  });

  //Check if mail exists

  //TODO: Change to verify function
  if (postdata.sendmail !== undefined) {
    meme.sendmail = postdata.sendmail;
  }

  meme.save(function (err,result) {

    if (err) return handleError(err);

    //Create Meme Parameters
    //TODO: Verify parameters before committing them
    var parameters = new MemeParameters({
      modelstring : postdata.modelstring,
      treemode    : postdata.treemode,
      pvalue      : postdata.pvalue,
    });

    //Save Meme Parameters to parent Meme object
    parameters.save(function (err, meme_result) {
      if (err) return handleError(err);

      else {
        // Open Multiple Sequence Alignment File to get all necessary parameters
        // for dispatching.
        Msa.findOne({_id : seqid}, function(err, msa) {
          if (err)
            res.send('There is no sequence with id of ' + id);

           else {
             //Take the current parameters, and add MEME specific params
             var params = {
                'method'        : globals.MEME,
                'treeMode'      : meme_result.treemode,
                'root'          : meme_consts.root,
                'modelstring'   : meme_result.modelstring,
                'namedmodels'   : "",
                'roptions'      : meme_consts.roptions,
                'dnds'          : meme_consts.dnds,
                'ambchoice'     : meme_consts.ambchoice,
                'pvalue'        : meme_result.pvalue,
                'rateoption'    : meme_consts.rateoption,
                'rateclasses'   : meme_consts.rateclasses,
                'rateoption2'   : meme_consts.rateoption2,
                'rateclasses2'  : meme_consts.rateclasses2
             };

             //Dispatch the analysis to the perl script
             dpl.dispatchAnalysis(meme._id,msa,params,res);

             // TODO: We should return the status id ticket here instead of
             // inside dispatchAnalysis
           }
        });
      }

      meme.parameters.push(parameters);
      meme.save();

    });
  });
}

//Query job status
exports.queryStatus = function(req, res) {

  Meme.findOne({_id : req.params.memeid}, function(err, item) {
    if (err)
      res.send('There is no sequence with id of ' + req.memeid);

    else {
      //This should eventually be its own polling task
      res.send({status:item.status});
    }
  });
}

//Return results
exports.results = function(req, res) {

  //Return all results
  Meme.findOne({_id : req.params.memeid}, function(err, item) {

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
exports.mail = function(req, res) {
  mailer.send();  
  res.send({response:'Mail Sent!'});
}

