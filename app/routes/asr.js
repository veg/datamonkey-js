
var mongoose = require('mongoose')
  , Asr = mongoose.model('Asr');

//Need to add sequence file

//find sequence by id
exports.findById = function(req, res) {

   var id = req.params.id;
   console.log('Retrieving sequence: ' + id);

   Asr.findOne({_id : id}, function(err, items) {
      if (err)
         res.send('There is no sequence with id of ' + id);
       else
         res.send(items);
   });

};

//return all sequences
exports.findAll = function(req, res) {

   Asr.find({},function(err, items) {
      if (err)
         res.send('There is no sequence with id of ' + id);
       else
         res.send(items);
   });

};

//upload a sequence
exports.addAsr = function(req, res) {

    postdata = req.query;
    console.log('Adding sequence: ' + JSON.stringify(postdata));

    //Should check the postdata before
    Asr.create(postdata, function (err, result) {
        if (err) {
            res.send({'error':'An error has occurred'});
        } else {
            console.log('Success: ' + JSON.stringify(result));
            res.send(result);
        }
    });

}

//update a sequence
exports.updateAsr = function(req, res) {

    var id = req.params.id;
    var postdata = req.body;

    console.log('Updating sequence: ' + id);
    console.log(JSON.stringify(sequence));

    //Should check the postdata before
    Asr.update(postdata, function (err, result) {
        if (err) {
            res.send({'error':'An error has occurred'});
        } else {
            console.log('Success: ' + JSON.stringify(result));
            res.send(postdata);
        }
    });
 
}

//delete a sequence
exports.deleteAsr = function(req, res) {

    var id = req.params.id;
    console.log('Deleting sequence: ' + id);

    Asr.remove({ _id: new BSON.ObjectID(id) }, function(err) {
        if (err) {
            res.send({'error':'An error has occurred - ' + err});
        }

        else {
            console.log('' + result + ' document(s) deleted');
            res.send(req.body);
         }
    });
    
}

