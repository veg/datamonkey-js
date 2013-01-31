var dpl = require('datamonkey-pl');

var mongoose = require('mongoose')
  , SequenceAlignmentFile = mongoose.model('SequenceAlignmentFile');

//find sequence by id
exports.findById = function(req, res) {

   var id = req.params.id;
   console.log('Retrieving sequence: ' + id);

   SequenceAlignmentFile.findOne({_id : id}, function(err, items) {
      if (err)
         res.send('There is no sequence with id of ' + id);
       else
         res.send(items);
   });

};

//return all sequences
exports.findAll = function(req, res) {

   SequenceAlignmentFile.find({},function(err, items) {
      if (err)
         res.send('There is no sequence with id of ' + id);
       else
         res.send(items);
   });

};

//upload a sequence
exports.addSequenceAlignmentFile = function(req, res) {

    postdata = req.query;
    postdata.contents = postdata.contents.join('')

    //Curate the postdata for fields we only want
    datatype = 0 
    genCodeId = 0 

    //Should check the postdata before
    SequenceAlignmentFile.create(postdata, function (err, result) {

        if (err) {
            res.send({'error':'An error has occurred'});
        } else {
            //Upload to datamonkey
            dpl.uploadToPerl(result,res);
        }
    });
}

//update a sequence
exports.updateSequenceAlignmentFile = function(req, res) {

    var id = req.params.id;
    var postdata = req.body;

    console.log('Updating sequence: ' + id);
    console.log(JSON.stringify(sequence));

    //Should check the postdata before
    SequenceAlignmentFile.update(postdata, function (err, result) {
        if (err) {
            res.send({'error':'An error has occurred'});
        } else {
            console.log('Success: ' + JSON.stringify(result));
            res.send(postdata);
        }
    });
 
}

//delete a sequence
exports.deleteSequenceAlignmentFile = function(req, res) {

    var id = req.params.id;
    console.log('Deleting sequence: ' + id);

    SequenceAlignmentFile.remove({ _id: new BSON.ObjectID(id) }, function(err) {
        if (err) {
            res.send({'error':'An error has occurred - ' + err});
        }

        else {
            console.log('' + result + ' document(s) deleted');
            res.send(req.body);
         }
    });
    
}

