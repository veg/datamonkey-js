var mongoose = require('mongoose')
  , Analysis = mongoose.model('Analysis');

//find sequence by id
exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving sequence: ' + id);
    db.collection('sequences', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

//return all sequences
exports.findAll = function(req, res) {
    db.collection('sequences', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

//upload a sequence
exports.addSequence = function(req, res) {
    var sequence = req.query;
    console.log('Adding sequence: ' + JSON.stringify(sequence));
    db.collection('sequences', function(err, collection) {
        collection.insert(sequence, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

//update a sequence
exports.updateSequence = function(req, res) {
    var id = req.params.id;
    var sequence = req.body;
    console.log('Updating sequence: ' + id);
    console.log(JSON.stringify(sequence));

    db.collection('sequences', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, sequence, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating sequence: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(sequence);
            }
        });
    });

}

//delete a sequence
exports.deleteSequence = function(req, res) {
    var id = req.params.id;
    console.log('Deleting sequence: ' + id);
    db.collection('sequences', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}

