var express = require('express'),
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

app.listen(3000);
console.log('Listening on port 3000...');
module.exports = app;
