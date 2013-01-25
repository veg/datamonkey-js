var querystring = require('querystring');
var http = require('http');
var fs = require('fs');

var mongoose = require('mongoose')
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

    //console.log('Adding meme analysis: ' + JSON.stringify(postdata));
    postdata = req.query;

    //TODO: Get Results working
    //req.assert('seqid', 'No seqid').notEmpty();
    //req.assert('treemode', 'No treemode').isInt();
    //req.assert('modelstring', 'No model specified').notEmpty();
    //req.assert('pvalue', 'No pvalue specified').isInt();
    
    seqid =  postdata.seqid;
    delete postdata.seqid;

   var meme = new Meme({
          sequencefn : seqid,
      });
    
    meme.save(function (err,result) {

      if (err) return handleError(err);
      
      var parameters = new MemeParameters({
          //_creator: meme._id,    // assign an ObjectId
          modelstring : postdata.modelstring,
          treemode    : postdata.treemode,
          pvalue      : postdata.pvalue,
      });
      
      parameters.save(function (err, result) {
        if (err) return handleError(err);
        else
            console.log(result);
            res.send(result);
      });

      meme.parameters.push(parameters);
      meme.save();

    })

    //Define the root for the meme param
    //root = 

    //Send JSON object to dispatch analysis
    //Ensure a 200

    var meme_params = querystring.stringify({
        'seqfile' : seqid,
        'method' : constants.MEME,
        'treeMode' : meme.parameters.treemode,
        'root' : root,
        'modelString' : meme.parameters.modelstring,
        'NamedModels' : "",
        'rOptions' : 4,
        'dNdS' : 1.0,
        'ambChoice' : 0,
        'pValue' : meme.parameters.pvalue,
        'rateOption' : 0,
        'rateClasses' : 2,
        'rateOption2' : 1,
        'rateClasses2' : 2,
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

