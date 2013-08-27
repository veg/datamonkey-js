/*

  Datamonkey - An API for comparative analysis of sequence alignments using state-of-the-art statistical models.

  Copyright (C) 2013
  Sergei L Kosakovsky Pond (spond@ucsd.edu)
  Steven Weaver (sweaver@ucsd.edu)

  Permission is hereby granted, free of charge, to any person obtaining a
  copy of this software and associated documentation files (the
  'Software'), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be included
  in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS
  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

var redis = require('redis'),
    publisher  = redis.createClient();

var setup    = require( ROOT_PATH + '/config/setup'),
    fs       = require('fs'),
    ioclient = require('socket.io-client');

var mongoose = require('mongoose'),
    HivCluster = mongoose.model('HivCluster');


function ClientSocket(socket, hiv_cluster_id) {
  this.channel_id = 'job_hiv_cluster_' + hiv_cluster_id;
  this.socket = socket;
  this.subscriber = redis.createClient(), 
  this.subscriber.subscribe(this.channel_id);
  this.initializeServer();
};

ClientSocket.prototype.initializeServer = function () {
  // We need to attach to events emitted by the worker job
  var self = this;
  self.subscriber.on('message', function(channel, message) {
    var redis_packet = JSON.parse(message);
    if(redis_packet.type == 'status update') {
      self.socket.emit(redis_packet.type, redis_packet.msg);
    } else if (redis_packet.type == 'completed') {
      self.socket.emit(redis_packet.type, redis_packet.msg);
    }
  });
}

function HPCSocket (hiv_cluster) {
  this.hiv_cluster = hiv_cluster;
  this.initializeServer();
};

HPCSocket.prototype.initializeServer = function () {

  var self = this;
  var server_socket = ioclient.connect(setup.cluster_ip, {'force new connection': true});

  server_socket.on('connected', function (data) {
    self.sendToCluster(function (to_send){  
        server_socket.emit('spawn',  to_send);
      });
  });

  server_socket.on('status update', function (data) {

    // Update document with status update
    self.hiv_cluster.status = data.status_update;

    var redis_packet = {
      type : 'status update',
      msg  : data.status_update
    }

    //Update the status for the analysis
    self.hiv_cluster.save( function (err, result) {
      if (err) throw err;
      publisher.publish('job_hiv_cluster_' + self.hiv_cluster._id, JSON.stringify(redis_packet));
    });

  });

  server_socket.on('completed', function (data) {

    server_socket.disconnect();

    var redis_packet = {
      type          : 'completed',
      msg           : 'Job Completed'
    }

    // Write to database
    self.hiv_cluster.status      = 'Completed';
    self.hiv_cluster.graph_dot   = data.results.graph_dot;
    self.hiv_cluster.cluster_csv = data.results.cluster_csv;

    //Update the status for the analysis
    self.hiv_cluster.save( function (err, result) {
      if (err) throw err;
      publisher.publish('job_hiv_cluster_' + self.hiv_cluster._id, JSON.stringify(redis_packet));
    });

  });

  
}

HPCSocket.prototype.sendToCluster = function (cb) {

  //Preparing job for the cluster
  var to_send = {};
  to_send.filename           = this.hiv_cluster.filename;
  to_send.distance_threshold = this.hiv_cluster.distance_threshold;
  to_send.min_overlap        = this.hiv_cluster.min_overlap;
  to_send.ambiguity_handling = this.hiv_cluster.ambiguity_handling;

  fs.readFile(this.hiv_cluster.filepath, function (err, data) {
    if (err) throw err;
    to_send.file_contents = String(data);
    cb(to_send);
  });

}

exports.ClientSocket = ClientSocket;
exports.HPCSocket = HPCSocket;
