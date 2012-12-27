var express  = require('express'),
    sequence = require('./routes/sequence'),
    job = require('./routes/jobs');

var app = express();

app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

app.get('/jobs', job.findAll);
app.get('/jobs/:id', job.findById);
app.post('/jobs', job.addjob);
app.put('/jobs/:id', job.updatejob);
app.delete('/jobs/:id', job.deletejob);

app.get('/sequence', sequence.findAll);
app.get('/sequence/:id', sequence.findById);
app.post('/sequence', sequence.addSequence);
app.put('/sequence/:id', sequence.updateSequence);
app.delete('/sequence/:id', sequence.deleteSequence);

app.listen(3000);
console.log('Listening on port 3000...');
module.exports = app;
