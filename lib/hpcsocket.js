/*

Datamonkey - An API for comparative analysis of sequence alignments using state-of-the-art statistical models.

Copyright (C) 2015
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

var logger = require(ROOT_PATH + '/lib/logger');

var redis = require('redis'),
    publisher = redis.createClient();

var setup = require( ROOT_PATH + '/config/setup'),
    fs = require('fs'),
    ioclient = require('socket.io-client'),
    mailer = require('./mailer.js'),
    ss = require('socket.io-stream');

var mongoose = require('mongoose');

/**
* Opens a socket between datamonkey and the client browser
* Subscribes user to redis channel that gives status updates
* concerning the job.
* For a list of valid status updates, visit the job model.
* @param socket {Object} Socket that is opened between datamonkey and client
* @param job_id {String} The id of the job
*/

function ClientSocket(socket, job_id) {

  this.channel_id = 'job_' + job_id;
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
    self.socket.emit(redis_packet.type, redis_packet);
  });

}

/**
* Opens a socket between datamonkey and the HPC cluster
* Spawns a job to the cluster
* Listens for events via socketio emitted by the datamonkey-server application
* Creates a redis channel and publishes status updates from the cluster
* @param job {Object} an job document
*/

function HPCSocket (job, callback) {

  this.channel_prefix = 'job_';
  this.job = job;
  this.initializeServer(callback);

};

/**
* Initializes object
*/

HPCSocket.prototype.initializeServer = function (callback) {

  var self = this;

  var server_socket = ioclient.connect(setup.cluster_ip, {'connect timeout': 1000, 
                                                          'force new connection': true, 
                                                          'reconnect': false});

  var handleError = function(data) {

    // Update document with status update
    self.job.analysis.status = "Aborted";

    var redis_packet = {
      type : 'script error',
      msg  : data.error
    }

    if(self.job.analysis.mail) {
      mailer.sendJobError(self.job.analysis);
    }


    self.job.analysis.error_message = data.error;

    //Update the status for the analysis
    self.job.analysis.save( function (err, result) {
      if (err) throw err;
      publisher.publish(self.channel_prefix + self.job.analysis._id,
                        JSON.stringify(redis_packet));
    });

  }

  var connectionError = function(err) {
    var err = "Problem connecting to " + setup.cluster_ip + ". " + err;
    logger.error(err);
    var data = {"error": "Job could not be submitted to cluster."};
    handleError(data);
  }

  server_socket.on('connect_error', connectionError);
  server_socket.on('connect_timeout', connectionError);
  server_socket.on('error', connectionError);

  // Once connected to the server, prepare the request and spawn the item.
  server_socket.on('connected', function (data) {

    //Send file
    var stream = ss.createStream();
    ss(server_socket).emit('spawn', stream, { job : self.job, 
                                              status_stack : self.job.status_stack });

    fs.createReadStream(self.job.filepath).pipe(stream);
    callback();

  });

  // If there is an error, abort the mission
  server_socket.on('script error', function (data) {
    handleError(data);
  });

  // Routine status update
  server_socket.on('status update', function (data) {

    // Update document with status update
    self.job.analysis.status = data.phase;
    self.job.analysis.last_status_msg = data.msg;

    //Update the status for the analysis
    self.job.analysis.save( function (err, result) {

      if (err) throw err;

      var redis_packet = {
        type       : 'status update',
        msg        : data.msg,
        phase      : data.phase,
        index      : result.status_index,
        torque_id  : result.torque_id,
        percentage : result.percentage_complete
      }

      publisher.publish(self.channel_prefix + self.job.analysis._id,
                        JSON.stringify(redis_packet));

    });
  });

  // Routine status update
  server_socket.on('job created', function (data) {

    // Update document with status update
    self.job.analysis.torque_id = data.torque_id;

    //Update the status for the analysis
    self.job.analysis.save( function (err, result) {

      if (err) throw err;

      var redis_packet = {
        type : 'job created',
        msg : self.job.analysis.torque_id
      }

      publisher.publish(self.channel_prefix + self.job.analysis._id,
                        JSON.stringify(redis_packet));

      });


  });

  // Progress file
  ss(server_socket).on('progress file', function(stream, params) {
    var data = '';

    //Update the status for the analysis
    stream.on('data', function(chunk) {
      data = data + chunk;
    });

    stream.on('end', function(chunk) {

      var redis_packet = {
        type : 'status update',
        msg : data
      }

      publisher.publish(self.channel_prefix + self.job.analysis._id,
                        JSON.stringify(redis_packet));

      });

  });

  server_socket.on('server file', function (data) {

    var filepath = __dirname + '/../uploads/hivtrace/' + data.params.fn;
    fs.writeFile(filepath, data.buffer, function(err) {
        if(err) {
          logger.error(err);
        } else {
          server_socket.emit('server file saved');
          logger.log("The file was saved!");
        }
    }); 

  });

  // Job completed, store the results
  server_socket.on('completed', function (data) {
    
    server_socket.disconnect();

    var redis_packet = {
      type : 'completed',
      msg  : data
    }

    // Write to database
    self.job.analysis.status  = 'Completed';

    if(data) {
      self.job.analysis.results = data.results;
      logger.info('job complete; got results');
    } else {
      logger.error('job complete, but no data received');
    }


    if(self.job.analysis.mail) {
      mailer.sendJobComplete(self.job.analysis);
    }

    //Update the status for the analysis
    self.job.analysis.save(function (err, result) {
      if (err) throw err;
      publisher.publish(self.channel_prefix + self.job.analysis._id,
                        JSON.stringify(redis_packet));
    });

  });
  
}

exports.ClientSocket = ClientSocket;
exports.HPCSocket = HPCSocket;
