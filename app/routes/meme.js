var querystring = require('querystring');

var dpl = require('../../lib/datamonkey-pl.js');
var dme = require('../../lib/datamonkey-event.js');
var globals = require('../../config/globals.js');

var mongoose = require('mongoose')
  , SequenceAlignmentFile = mongoose.model('SequenceAlignmentFile')
  , Meme = mongoose.model('Meme')
  , MemeParameters = mongoose.model('MemeParameters');


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
exports.addMeme = function(req, res) {

  postdata = req.query;
  seqid =  postdata.seqid;

  //Create Meme Analysis
  var meme = new Meme({
    msafn  : seqid,
    status : globals.queue,
  });
  
  meme.save(function (err,result) {

    if (err) return handleError(err);

    //Create Meme Parameters
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
        SequenceAlignmentFile.findOne({_id : seqid}, function(err, msa) {
          if (err)
            res.send('There is no sequence with id of ' + id);

           else {

             //Take the current parameters, and add MEME specific params
             //TODO: MEME specific params should be in globals
             var params = {
                'method'        : globals.MEME,
                'treeMode'      : meme_result.treemode,
                'root'          : "SRC1",
                'modelstring'   : meme_result.modelstring,
                'namedmodels'   : "",
                'roptions'      : 4,
                'dnds'          : 1.0,
                'ambchoice'     : 0,
                'pvalue'        : meme_result.pvalue,
                'rateoption'    : 0,
                'rateclasses'   : 2,
                'rateoption2'   : 1,
                'rateclasses2'  : 2
             };

             //Dispatch the analysis to the perl script
             dpl.dispatchAnalysis(meme._id,msa,params,res);

             //TODO: We should return the status id ticket

           }
        });
      }

      meme.parameters.push(parameters);
      meme.save();

    });
  });
}

//Query A MEME Analysis
exports.queryStatus = function(req, res) {

  Meme.findOne({_id : req.params.memeid}, function(err, item) {

  if (err)
     res.send('There is no sequence with id of ' + req.memeid);

   else {
      //This should eventually be its own polling task
      //That pushes out to the user
      dme.jobListener.start(globals.types.meme, item);
   }

  });

}

