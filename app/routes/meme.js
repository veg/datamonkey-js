var dpl = require('../../lib/datamonkey-pl.js');
var querystring = require('querystring');
var globals = require('../../config/globals.js');

var mongoose = require('mongoose')
  , SequenceAlignmentFile = mongoose.model('SequenceAlignmentFile')
  , Meme = mongoose.model('Meme')
  , MemeParameters = mongoose.model('MemeParameters');

//Need to add sequence file


//find sequence by id
exports.findById = function(req, res) {

   var id = req.params.id;
   console.log('Retrieving sequence: ' + id);

   Meme.findOne({_id : id}, function(err, items) {
      if (err)
         res.send('There is no sequence with id of ' + id);
       else
         res.send(items);
   });
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

//upload a sequence
exports.addMeme = function(req, res) {

  postdata = req.query;
 
  seqid =  postdata.seqid;
  delete postdata.seqid;

  var meme = new Meme({
    msafn : seqid,
  });
  
  meme.save(function (err,result) {

    if (err) return handleError(err);

    console.log(globals.MEME);
      
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
             //Dispatch the analysis to the perl scripts
             debugger;
             dpl.dispatchAnalysis(msa,meme_result,globals.MEME,res);
            }
        });
      }

      meme.parameters.push(parameters);
      meme.save();

    });
  });
}

//update a sequence
exports.updateMeme = function(req, res) {

    var id = req.params.id;
    var postdata = req.body;

    console.log('Updating sequence: ' + id);
    console.log(JSON.stringify(sequence));

    //Should check the postdata before
    Meme.update(postdata, function (err, result) {
        if (err) {
            res.send({'error':'An error has occurred'});
        } else {
            console.log('Success: ' + JSON.stringify(result));
            res.send(postdata);
        }
    });
 
}

//delete a sequence
exports.deleteMeme = function(req, res) {

    var id = req.params.id;
    console.log('Deleting sequence: ' + id);

    Meme.remove({ _id: new BSON.ObjectID(id) }, function(err) {
        if (err) {
            res.send({'error':'An error has occurred - ' + err});
        }

        else {
            console.log('' + result + ' document(s) deleted');
            res.send(req.body);
         }
    });
    
}



