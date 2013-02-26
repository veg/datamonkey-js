var express  = require('express'),
    expressValidator = require('express-validator'),
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
    app.use(expressValidator);
    app.use(express.bodyParser());
});

// Bootstrap models
var models_path = __dirname + '/app/models';

fs.readdirSync(models_path).forEach(function (file) {
  require(models_path+'/'+file)
});

//TODO: Put routes in different file
seqfile = require('./app/routes/seqfile');
app.get('/seqfile', seqfile.findAll);
app.get('/seqfile/:id', seqfile.findById);
app.post('/seqfile', seqfile.addSequenceAlignmentFile);
app.put('/seqfile/:id', seqfile.updateSequenceAlignmentFile);
app.delete('/seqfile/:id', seqfile.deleteSequenceAlignmentFile);

//TODO: Update with a status route
meme = require('./app/routes/meme');
app.get('/meme', meme.findAll);
app.post('/seqfile/:seqid/meme', meme.addMeme);
app.get('/seqfile/:seqid/meme/:memeid', meme.queryStatus);
app.get('/seqfile/:seqid/meme/:memeid/parse', meme.parseResults);


//TODO: ASR
asr = require('./app/routes/asr');
app.get('/seqfile/:seqid/asr/', asr.findAll);
app.get('/seqfile/:seqid/asr/:id', asr.findById);
app.post('/seqfile/:seqid/asr', asr.addAsr);
app.put('/seqfile/:seqid/asr', asr.updateAsr);
app.delete('/seqfile/:seqid/asr/:id', asr.deleteAsr);

app.listen(3000);
console.log('Listening on port 3000...');
module.exports = app;



