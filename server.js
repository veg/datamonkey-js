/*
  Datamonkey - An API for comparative analysis of sequence alignments using state-of-the-art statistical models.

  Copyright (C) 2013
  Sergei L Kosakovsky Pond (spond@ucsd.edu)
  Steven Weaver (sweaver@ucsd.edu)

  Permission is hereby granted, free of charge, to any person obtaining a
  copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be included
  in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var setup = require('./config/setup');

ROOT_PATH = setup.rootpath;
SPOOL_DIR = setup.spooldir;
HOST      = setup.host;


// Necessary packages
var express          = require('express'),
    expressValidator = require('express-validator'),
    helpers          = require('./lib/helpers'),
    fs               = require('fs'),
    path             = require("path"),
    mongoose         = require('mongoose'),
    io               = require('socket.io').listen(setup.socket_port);


// Connect to database
mongoose.connect(setup.database);

// Main app configuration
var app = express();
app.configure(function () {
    app.use(express.compress());
    app.use(express.logger(setup.logger));     
    app.use(expressValidator);
    app.use(express.bodyParser());
    app.use(express.limit('25mb'));
    app.use(app.router);
    app.set('json spaces', 0);
});

// Bootstrap models
var models_path = __dirname + '/app/models';
fs.readdirSync(models_path).forEach(function (file) {
  require(models_path+'/'+file);
});

require('./config/routes')(app);
app.set('views', __dirname + '/app/templates');
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static(__dirname + '/uploads'));

//Port to listen on
app.listen(setup.port);

helpers.logger.info('Listening on port ' + setup.port + '...');
module.exports = app;

// Set up socket.io server
var jobproxy = require('./lib/hpcsocket.js');

io.sockets.on('connection', function (socket) {
  socket.emit('connected');
  socket.on('acknowledged', function (data) {
    //Create client socket
    var clientSocket = new jobproxy.ClientSocket(socket, data.id);
  });
});

