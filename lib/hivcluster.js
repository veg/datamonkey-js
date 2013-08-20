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

var setup    = require( ROOT_PATH + '/config/setup'),
    fs       = require('fs'),
    io       = require('socket.io').listen(setup.socket_port),
    ioclient = require('socket.io-client');

var mongoose = require('mongoose'),
    HivCluster = mongoose.model('HivCluster');


function JobProxy() {
  this.initializeServer();
};

JobProxy.prototype.initializeServer = function () {
  var self = this;

  io.sockets.on('connection', function (socket) {

    var server_socket = ioclient.connect(setup.cluster_ip);

    server_socket.on('connected', function (data) {
      console.log("connected to silverback");
      socket.emit('connected', { hello: 'world' });
    });

    server_socket.on('status update', function (data) {
      console.log("got a status update");
      socket.emit('status update', data);
    });

    server_socket.on('completed', function (data) {
      console.log("got a status update");
      socket.emit('completed', data);
    });


    socket.on('spawn', function (data) {
      console.log('spawning job'); 
      self.sendToCluster(data.id, function (to_send){  
        server_socket.emit('spawn',  to_send);
      });
    });

  });

}

JobProxy.prototype.sendToCluster = function(hiv_cluster_id, cb) {
  //Spawning job on cluster
  var self = this;
 
  HivCluster.findOne({_id: hiv_cluster_id}, function (err, hiv_cluster) {

    var to_send = {};
    to_send.filename           = hiv_cluster.filename;
    to_send.distance_threshold = hiv_cluster.distance_threshold;
    to_send.min_overlap        = hiv_cluster.min_overlap;
    to_send.ambiguity_handling = hiv_cluster.ambiguity_handling;

    fs.readFile(hiv_cluster.filepath, function (err, data) {
      if (err) throw err;
      to_send.file_contents = String(data);
      cb(to_send);
    });

  });

}


exports.JobProxy = JobProxy;
