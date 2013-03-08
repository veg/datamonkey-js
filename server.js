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

analysis = require('./app/routes/analysis');
app.get('/msa/:msaid/:type', analysis.findAll);
app.post('/msa/:msaid/:type', analysis.invokeJob);
app.get('/msa/:msaid/:type/:typeid', analysis.queryStatus);
app.get('/msa/:msaid/:type/:typeid/results', analysis.getResults);
app.get('/msa/:msaid/:type/:typeid/mail', analysis.sendMail);
app.get('/msa/:msaid/:type/:typeid/parseresults', analysis.parseResults);


//TODO: Update with a status route
//app.post('/msa/:msaid/meme', meme.invokeJob);
//app.get('/msa/:msaid/meme/:memeid', meme.queryStatus);
//app.get('/msa/:msaid/meme/:memeid/results', meme.getResults);
//app.get('/msa/:msaid/meme/:memeid/mail', meme.sendMail);

//TODO: ASR
//asr = require('./app/routes/asr');
//app.get('/msa/:msaid/asr/', asr.findAll);
//app.get('/msa/:msaid/asr/:id', asr.findById);
//app.post('/msa/:msaid/asr', asr.addAsr);
//app.put('/msa/:msaid/asr', asr.updateAsr);
//app.delete('/msa/:msaid/asr/:id', asr.deleteAsr);

app.listen(3000);
console.log('Listening on port 3000...');
module.exports = app;
