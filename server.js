var express  = require('express'),
    fs = require('fs'),
    path = require("path"),
    mongoose = require('mongoose');

//database
mongoose.connect('mongodb://localhost/datamonkey');

mongoose.connection.on('open', function() {
   console.log('Connected to datamonkey');
});

var app = express();

app.configure(function () {
    app.use(app.router);
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

// Bootstrap models
var models_path = __dirname + '/app/models';

fs.readdirSync(models_path).forEach(function (file) {
  require(models_path+'/'+file)
});

sequence = require('./app/routes/sequence');

app.get('/sequence', sequence.findAll);
app.get('/sequence/:id', sequence.findById);
app.post('/sequence', sequence.addSequence);
app.put('/sequence/:id', sequence.updateSequence);
app.delete('/sequence/:id', sequence.deleteSequence);

//analysis = require('./app/routes/analysis');
//app.get('sequence/:seqid/analysis/', analysis.findAll);
//app.get('/sequence/:seqid/analysis/:id', analysis.findById);
//app.post('/sequence/:seqid/analysis', analysis.addAnalysis);
//app.put('/sequence/:seqid/analysis', analysis.updateAnalysis);
//app.delete('/sequence/:seqid/analysis/:id', sequence.deleteAnalysis);

app.listen(3000);
console.log('Listening on port 3000...');
module.exports = app;

