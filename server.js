var express          = require('express'),
    expressValidator = require('express-validator'),
    fs               = require('fs'),
    path             = require("path"),
    mongoose         = require('mongoose');

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
msa = require('./app/routes/msa');
app.get('/msa', msa.findAll);
app.get('/msa/:id', msa.findById);
app.post('/msa', msa.uploadMsa);
app.put('/msa/:id', msa.updateMsa);
app.delete('/msa/:id', msa.deleteMsa);

//TODO: Update with a status route
meme = require('./app/routes/meme');
app.get('/meme', meme.findAll);
app.post('/msa/:seqid/meme', meme.invokeMemeJob);
app.get('/msa/:seqid/meme/:memeid', meme.queryStatus);
app.get('/msa/:seqid/meme/:memeid/results', meme.results);
app.get('/msa/:seqid/meme/:memeid/mail', meme.mail);


//TODO: ASR
asr = require('./app/routes/asr');
app.get('/msa/:seqid/asr/', asr.findAll);
app.get('/msa/:seqid/asr/:id', asr.findById);
app.post('/msa/:seqid/asr', asr.addAsr);
app.put('/msa/:seqid/asr', asr.updateAsr);
app.delete('/msa/:seqid/asr/:id', asr.deleteAsr);

app.listen(3000);
console.log('Listening on port 3000...');
module.exports = app;


