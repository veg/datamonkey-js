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
  delete postdata.seqid;

  var meme = new Meme({
    msafn  : seqid,
    status : globals.queue,
  });
  
  //Save the Parent Meme
  meme.save(function (err,result) {

    if (err) return handleError(err);

    var parameters = new MemeParameters({
      modelstring : postdata.modelstring,
      treemode    : postdata.treemode,
      pvalue      : postdata.pvalue,
    });
    
    parameters.save(function (err, meme_result) {
      if (err) return handleError(err);

      else {
        //Open Multiple Sequence Alignment File
        SequenceAlignmentFile.findOne({_id : seqid}, function(err, msa) {
          if (err)
            res.send('There is no sequence with id of ' + id);

           else {

             //Take the current parameters, and add MEME specific params
             //MEME specific params should be in globals
             var params = {
                'method'        : globals.MEME,
                'treeMode'      : meme_result.treemode,
                'root'          : "SRC1",
                'modelString'   : meme_result.modelstring,
                'NamedModels'   : "",
                'rOptions'      : 4,
                'dNdS'          : 1.0,
                'ambChoice'     : 0,
                'pValue'        : meme_result.pvalue,
                'rateOption'    : 0,
                'rateClasses'   : 2,
                'rateOption2'   : 1,
                'rateClasses2'  : 2
             };

             //Dispatch the analysis to the perl scripts
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
      var hello = dme.jobListener.start(globals.types.meme, item);
   }

  });

}

