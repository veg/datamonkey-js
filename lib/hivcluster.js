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
    mailer   = require( ROOT_PATH + '/lib/mailer'),
    dl       = require('delivery'),
    ioclient = require('socket.io-client'),
    ss = require('socket.io-stream');

var mongoose = require('mongoose'),
    HivCluster = mongoose.model('HivCluster');


/**
 * Opens a socket between datamonkey and the client browser
 * Subscribes user to redis channel that gives status updates 
 * concerning the job.
 * For a list of valid status updates, visit the HivCluster model.
 * @param socket {Object} Socket that is opened between datamonkey and client
 * @param hiv_cluster_id {String} The id of the job
 */

function ClientSocket(socket, hiv_cluster_id) {
  this.channel_id = 'job_hiv_cluster_' + hiv_cluster_id;
  this.socket = socket;
  this.subscriber = redis.createClient(); 
  this.subscriber.subscribe(this.channel_id);
  this.initializeServer();
};


/**
 * Initializes by triggering socket events on redis channel events
 */
ClientSocket.prototype.initializeServer = function () {
  // We need to attach to events emitted by the worker job
  var self = this;
  self.subscriber.on('message', function(channel, message) {
    var redis_packet = JSON.parse(message);
    if(redis_packet.type == 'status update') {
      self.socket.emit(redis_packet.type, redis_packet);
    } else if (redis_packet.type == 'completed') {
      self.socket.emit(redis_packet.type, redis_packet);
    }
  });
}

/**
 * Opens a socket between datamonkey and the HPC cluster
 * Spawns a job to the cluster
 * Listens for events via socketio emitted by the datamonkey-server application
 * Creates a redis channel and publishes status updates from the cluster
 * @param hiv_cluster {Object} an HivCluster document
 */

function HPCSocket (hiv_cluster) {
  this.channel_prefix = 'job_hiv_cluster_';
  this.hiv_cluster = hiv_cluster;
  this.initializeServer();
};

/**
 * Initializes object
 */
HPCSocket.prototype.initializeServer = function () {

  var self = this;
  var server_socket = ioclient.connect(setup.cluster_ip, {'force new connection': true, 'reconnect': false});

  // Once connected to the server, prepare the request and spawn the item.
  server_socket.on('connected', function (data) {
    self.prepareForCluster(function (to_send){  
        server_socket.emit('spawn',  to_send);
      });
  });

  // Is there is an error, abort the mission
  server_socket.on('error', function (data) {

    // Update document with status update
    self.hiv_cluster.status = "Aborted";

    var redis_packet = {
      type : 'status update',
      msg  : 'Aborted:' + data.error
    }

    //Update the status for the analysis
    self.hiv_cluster.save( function (err, result) {
      if (err) throw err;
      publisher.publish(self.channel_prefix + self.hiv_cluster._id, 
                        JSON.stringify(redis_packet));
    });

  });

  // Routine status update
  server_socket.on('status update', function (data) {

    // Update document with status update
    self.hiv_cluster.status = data.status_update;


    //Update the status for the analysis
    self.hiv_cluster.save( function (err, result) {
      if (err) throw err;

      var redis_packet = {
        type       : 'status update',
        msg        : self.hiv_cluster.status,
        index      : self.hiv_cluster.status_index,
        percentage : self.hiv_cluster.percentage_complete
      }

      publisher.publish(self.channel_prefix + self.hiv_cluster._id, 
                        JSON.stringify(redis_packet));

    });

  });

  // Routine status update
  server_socket.on('job created', function (data) {

    // Update document with status update
    self.hiv_cluster.torque_id = data.job_id;

    //Update the status for the analysis
    self.hiv_cluster.save( function (err, result) {
      if (err) throw err;
    });
  });

  // Routine status update
  server_socket.on('tn93 summary', function (data) {
    // Update document with status update
    self.hiv_cluster.tn93_summary = data.summary;

    //Update the status for the analysis
    self.hiv_cluster.save( function (err, result) {
      if (err) throw err;
    });
  });

  ss(server_socket).on('send file', function(stream, params) {
    var filepath = setup.root_hivcluster_path + params.id + '_' + params.type;
    stream.pipe(fs.createWriteStream(filepath));
    stream.on('end', function() {
      self.hiv_cluster[params.type] = filepath;
      //Update the status for the analysis
      self.hiv_cluster.save( function (err, result) {
        if (err) throw err;
        server_socket.emit('file saved');
      });
    });
  });

  // Job completed, store the results
  server_socket.on('completed', function (data) {

    server_socket.disconnect();

    var redis_packet = {
      type          : 'completed',
      msg           : 'Job Completed'
    }

    // Write to database
    self.hiv_cluster.status      = 'Completed';

    //Update the status for the analysis
    self.hiv_cluster.save( function (err, result) {
      if (err) throw err;
      publisher.publish(self.channel_prefix + self.hiv_cluster._id,
                        JSON.stringify(redis_packet));
      mailer.mailHivCluster(result);
    });

  });
  
}

/**
 * Prepares data to be sent to the cluster
 */
HPCSocket.prototype.prepareForCluster = function (cb) {

  //Preparing job for the cluster
  var to_send = {};
  to_send.filename           = this.hiv_cluster.filename;
  to_send.distance_threshold = this.hiv_cluster.distance_threshold;
  to_send.min_overlap        = this.hiv_cluster.min_overlap;
  to_send.ambiguity_handling = this.hiv_cluster.ambiguity_handling;
  to_send.status_stack       = this.hiv_cluster.status_stack;
  to_send.lanl_compare       = this.hiv_cluster.lanl_compare;

  // Read the file
  fs.readFile(this.hiv_cluster.filepath, function (err, data) {
    if (err) throw err;
    to_send.file_contents = String(data);
    cb(to_send);
  });

}

exports.ClientSocket = ClientSocket;
exports.HPCSocket = HPCSocket;
