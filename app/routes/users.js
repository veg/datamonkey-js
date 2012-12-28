//A user has:
// A name
// Sequences
// Analysis for sequences

var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('sequencedb', server);

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'sequencedb' database");
        db.collection('sequences', {safe:true}, function(err, collection) {
            if (err) {
                console.log("The 'sequences' collection doesn't exist. Creating it with sample data...");
                //populateDB();
            }
        });
    }
});

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

    //LEGACY
    //Now let us submit the job to the old datamonkey site
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

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {

    //Need to define file, datatype, and genetic code
    var sequences = [
    {
        sequence: "ACTG",
        datatype: 0,
        geneticcode: 0 
    },
    {
        sequence: "ACTC",
        datatype: 0,
        geneticcode: 0
    }];

    db.collection('sequences', function(err, collection) {
        collection.insert(sequences, {safe:true}, function(err, result) {});
    });

};
