var mongoose = require('mongoose')
  , Analysis = mongoose.model('Analysis');

//find sequence by id
exports.findById = function(req, res) {

   var id = req.params.id;
   console.log('Retrieving sequence: ' + id);

   Analysis.findOne({_id : id}, function(err, items) {
      if (err)
         res.send('There is no sequence with id of ' + id);
       else
         res.send(items);
   });

};

//return all sequences
exports.findAll = function(req, res) {

   Analysis.find({},function(err, items) {
      if (err)
         res.send('There is no sequence with id of ' + id);
       else
         res.send(items);
   });

};

//upload a sequence
exports.addAnalysis = function(req, res) {

    postdata = req.query;
    console.log('Adding sequence: ' + JSON.stringify(postdata));

    //Should check the postdata before
    Analysis.create(postdata, function (err, result) {
        if (err) {
            res.send({'error':'An error has occurred'});
        } else {
            console.log('Success: ' + JSON.stringify(result));
            res.send(result);
        }
    });

}

//update a sequence
exports.updateAnalysis = function(req, res) {

    var id = req.params.id;
    var postdata = req.body;

    console.log('Updating sequence: ' + id);
    console.log(JSON.stringify(sequence));

    //Should check the postdata before
    Analysis.update(postdata, function (err, result) {
        if (err) {
            res.send({'error':'An error has occurred'});
        } else {
            console.log('Success: ' + JSON.stringify(result));
            res.send(postdata);
        }
    });
 
}

//delete a sequence
exports.deleteAnalysis = function(req, res) {

    var id = req.params.id;
    console.log('Deleting sequence: ' + id);

    Analysis.remove({ _id: new BSON.ObjectID(id) }, function(err) {
        if (err) {
            res.send({'error':'An error has occurred - ' + err});
        }

        else {
            console.log('' + result + ' document(s) deleted');
            res.send(req.body);
         }
    });
    
}

