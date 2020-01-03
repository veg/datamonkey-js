var path = require("path"),
  redis = require("redis"),
  winston = require("winston"),
  setup = require(path.join(__dirname, "../config/setup.js")),
  publisher = redis.createClient({
    host: setup.redisHost,
    port: setup.redisPort
  });

(fs = require("fs")),
  (ioclient = require("socket.io-client")),
  (mailer = require("./mailer.js")),
  (ss = require("socket.io-stream"));

var logger = require(path.join(__dirname, "/logger"));

var mongoose = require("mongoose");

var loadBalance = require("./../lib/loadBal.js").loadBalance;
var default_setup_url = setup.default_url;

/**
 * Opens a socket between datamonkey and the client browser
 * Subscribes user to redis channel that gives status updates
 * concerning the job.
 * For a list of valid status updates, visit the job model.
 * @param socket {Object} Socket that is opened between datamonkey and client
 * @param job_id {String} The id of the job
 */

function ClientSocket(socket, job_id) {
  var self = this;

  self.channel_id = "job_" + job_id;
  self.socket = socket;
  self.subscriber = redis.createClient({
    host: setup.redisHost,
    port: setup.redisPort
  });
  self.subscriber.subscribe(self.channel_id);
  self.initializeServer();
}

/**
 * Initializes by triggering socket events on redis channel events
 */

ClientSocket.prototype.initializeServer = function() {
  // We need to attach to events emitted by the worker job
  var self = this;
  self.subscriber.on("message", function(channel, message) {
    var redis_packet = JSON.parse(message);
    self.socket.emit(redis_packet.type, redis_packet);
  });
};

/**
 * Opens a socket between datamonkey and the HPC cluster
 * Spawns a job to the cluster
 * Listens for events via socketio emitted by the datamonkey-server application
 * Creates a redis channel and publishes status updates from the cluster
 * @param job {Object} a job document
 * @param action {Object} a job document
 * @param callback {Object} a job document
 */

function HPCSocket(job, action, callback) {
  var self = this;
  var cluster_ip_urls_array = setup.cluster_ip_urls_array;
  self.channel_prefix = "job_";
  self.job = job;
  self.channel = self.channel_prefix + self.job.analysis._id;
  self.callback = callback;

  //This gets URL from loadBalance function located in loadBal.js
  loadBalance(cluster_ip_urls_array, (err, return_url) => {
    self.url = return_url;

    if (self.job.analysis.analysistype == "flea") {
      self.url = setup.flea_ip_address;
    }

    self.initializeServer(self.url, function() {
      if (action == "spawn") {
        self.spawn();
      } else if (action == "resubscribe") {
        self.resubscribe();
      } else if (action == "cancel") {
        self.cancel();
      }
    });
  });
}

HPCSocket.prototype.handleError = function(data) {
  var self = this;

  // Update document with status update
  self.job.analysis.status = "aborted";

  var redis_packet = {
    type: "script error",
    msg: self.job.analysis.generic_error_msg
  };

  if (self.job.analysis.mail) {
    mailer.sendJobError(self.job.analysis);
  }

  self.job.analysis.stdout = data.stdout ? data.stdout : "";
  self.job.analysis.stderr = data.stderr ? data.stderr : "";

  //Update the status for the analysis
  self.job.analysis.save(function(err, result) {
    if (err) winston.warn(err);
    publisher.publish(self.channel, JSON.stringify(redis_packet));
  });
};

HPCSocket.prototype.connectionError = function(err) {
  var self = this;

  err = "Problem connecting to " + self.url + ". " + err;
  logger.error(err);
  var data = { error: "Job could not be submitted to cluster." };

  self.handleError(data);
};

/**
 * Defines socket events
 */

HPCSocket.prototype.initializeServer = function(url_input, callback) {
  var self = this;

  self.server_socket = ioclient.connect(
    url_input,
    {
      "connect timeout": 1000,
      "force new connection": true,
      reconnection: false
    }
  );

  self.server_socket.on("connect_error", function() {
    self.connectionError();
  });
  self.server_socket.on("connect_timeout", function() {
    self.connectionError();
  });
  self.server_socket.on("error", function() {
    self.connectionError();
  });

  // If there is an error, abort the mission
  self.server_socket.on("script error", function(data) {
    self.server_socket.disconnect();
    self.handleError(data);
  });

  // Routine status update
  self.server_socket.on("status update", function(data) {
    // Update document with status update
    self.job.analysis.status = data.phase;
    self.job.analysis.last_status_msg = data.msg;
    self.job.analysis.creation_time = data.ctime || self.job.analysis.created;
    self.job.analysis.start_time = data.stime || self.job.analysis.start_time;
    self.job.analysis.torque_id = data.torque_id;

    //Update the status for the analysis
    self.job.analysis.save(function(err, result) {
      if (err) throw err;

      var redis_packet = {
        type: "status update",
        msg: data.msg,
        phase: data.phase,
        torque_id: result.torque_id,
        start_time: result.start_time,
        creation_time: result.creation_time,
        percentage: result.percentage_complete
      };

      publisher.publish(self.channel, JSON.stringify(redis_packet));
    });
  });

  // Routine status update
  self.server_socket.on("job created", function(data) {
    // Update document with status update
    self.job.analysis.torque_id = data.torque_id;

    //Update the status for the analysis
    self.job.analysis.save(function(err, result) {
      if (err) throw err;

      var redis_packet = {
        type: "job created",
        msg: self.job.analysis.torque_id
      };

      publisher.publish(self.channel, JSON.stringify(redis_packet));
    });
  });

  // aligned file
  self.server_socket.on("aligned fasta", function(data) {
    // write buffer out to file
    fs.writeFile(self.job.analysis.aligned_fasta_fn, data.buffer, function(
      err
    ) {
      if (err) throw err;
      winston.info("saved alignment fasta file");
    });

    //Update the status for the analysis
    self.job.analysis.save(function(err, result) {
      if (err) throw err;

      var redis_packet = {
        type: "job created",
        msg: self.job.analysis.torque_id
      };

      publisher.publish(self.channel, JSON.stringify(redis_packet));
    });
  });

  // gard nexus file
  self.server_socket.on("gard nexus file", function(data) {
    // write buffer out to file
    fs.writeFile(self.job.analysis.result_nexus_fn, data.buffer, function(err) {
      if (err) {
        winston.info(err);
      } else {
        winston.info("saved gard nexus file");
      }
    });
  });

  // flea session json file
  self.server_socket.on("flea session json file", function(data) {
    // write buffer out to file
    fs.writeFile(self.job.analysis.session_json_fn, data.buffer, function(err) {
      if (err) {
        winston.info(err);
      } else {
        winston.info("saved flea session json file");
      }
    });
  });

  // flea session zip file
  self.server_socket.on("flea session zip file", function(data) {
    // write buffer out to file
    fs.writeFile(self.job.analysis.session_zip_fn, data.buffer, function(err) {
      if (err) {
        winston.info(err);
      } else {
        winston.info("saved flea session zip file");
      }
    });
  });

  // Progress file
  ss(self.server_socket).on("progress file", function(stream, params) {
    var data = "";

    //Update the status for the analysis
    stream.on("data", function(chunk) {
      data = data + chunk;
    });

    stream.on("end", function(chunk) {
      var redis_packet = {
        type: "status update",
        msg: data
      };

      publisher.publish(self.channel, JSON.stringify(redis_packet));
    });
  });

  // Job completed, store the results
  self.server_socket.on("completed", function(data) {
    self.server_socket.disconnect();

    if (self.job.analysis.onComplete) {
      self.job.analysis.onComplete(data, publisher, self.channel);
    } else {
      var redis_packet = {
        type: "completed"
      };

      // Write to database
      self.job.analysis.status = "completed";

      if (data) {
        fs.writeFile(self.job.analysis.results_path, data.results, function(
          err
        ) {
          if (err) winston.warn(err);
          winston.info("saved results file");
        });
        logger.info("job complete; got results");
      } else {
        self.handleError(data);
        logger.error("job complete, but no data received");
      }

      if (self.job.analysis.mail) {
        mailer.sendJobComplete(self.job.analysis);
      }
      //Update the status for the analysis
      self.job.analysis.save(function(err, result) {
        if (err) throw err;
        publisher.publish(self.channel, JSON.stringify(redis_packet));
      });
    }
  });
  callback();
};

/**
 * Spawns a new job
 */
HPCSocket.prototype.spawn = function(callback) {
  var self = this;

  self.job.action = self.job.type + ":spawn";

  // Once connected to the server, prepare the request and spawn the item.
  self.server_socket.on("connected", function(data) {
    logger.info(self.job.analysis._id + " : " + self.job.action);

    var job_to_send = self.job;
    job_to_send = {
      filepath: self.job.filepath,
      msa: self.job.msa,
      analysis: self.job.analysis.toJSON(),
      status_stack: self.job.status_stack,
      type: self.job.type
    };

    //Send file
    var stream = ss.createStream();
    ss(self.server_socket).emit(self.job.action, stream, {
      job: job_to_send,
      status_stack: self.job.status_stack
    });

    fs.createReadStream(self.job.filepath).pipe(stream);
  });
};

/**
 * Resubscribes to existing id
 */
HPCSocket.prototype.resubscribe = function() {
  var self = this;
  self.job.action = self.job.type + ":resubscribe";

  // Once connected to the server, prepare the request and spawn the item.
  self.server_socket.on("connected", function(data) {
    self.server_socket.emit(self.job.action, { id: self.job.analysis._id });
  });
};

/**
 * Cancels an existing job
 */
HPCSocket.prototype.cancel = function() {
  var self = this;
  self.job.action = self.job.type + ":cancel";

  winston.info("cancelling job");

  // Once connected to the server, prepare the request and spawn the item.
  self.server_socket.on("connected", function(data) {
    self.server_socket.emit(self.job.action, { id: self.job.analysis._id });
  });

  self.server_socket.on("cancelled", function(data) {
    // Update document with status update
    self.job.analysis.status = "aborted";
    self.job.analysis.error_message = "Job was cancelled";

    //Update the status for the analysis
    self.job.analysis.save(function(err, result) {
      if (err) {
        self.callback(err, false);
      } else {
        self.callback(err, true);
      }
    });
  });
};

function ClusterStatus(url, callback) {
  this.initializeServer(url, callback);
}

/**
 * Initializes object
 */

ClusterStatus.prototype.initializeServer = function(url, callback) {
  var self = this;

  var server_socket = ioclient.connect(
    url,
    {
      "connect timeout": 1000,
      "force new connection": true,
      reconnection: false
    }
  );

  var connectionError = function(err) {
    callback({ successful_connection: false, msg: err });
    server_socket.disconnect();
  };

  server_socket.on("connect_error", connectionError);
  server_socket.on("connect_timeout", connectionError);
  server_socket.on("error", connectionError);

  // Once connected to the server, prepare the request and spawn the item.
  server_socket.on("connected", function(data) {
    callback({ successful_connection: true, msg: "Successful Connection" });
  });
};

function HPCSocketRecheck(job, callback) {
  var self = this;
  self.channel_prefix = "job_";
  self.job = job;
  self.channel = self.channel_prefix + self.job.analysis._id;
  self.job.action = "recheck";
  self.initializeServer(job, callback);
}

/**
 * Initializes object
 */

HPCSocketRecheck.prototype.initializeServer = function(job, callback) {
  var self = this;
  var server_socket = ioclient.connect(
    default_setup_url,
    {
      "connect timeout": 1000,
      "force new connection": true,
      reconnection: false
    }
  );

  var connectionError = function(err) {
    callback({ successful_connection: false, msg: err });
    server_socket.disconnect();
  };

  var handleError = function(data) {
    // Update document with status update
    self.job.analysis.status = "aborted";

    var redis_packet = {
      type: "script error",
      msg: self.job.analysis.stderr
    };

    if (self.job.analysis.mail) {
      mailer.sendJobError(self.job.analysis);
    }

    //Update the status for the analysis
    self.job.analysis.save(function(err, result) {
      if (err) throw err;
      publisher.publish(self.channel, JSON.stringify(redis_packet));
    });
  };

  server_socket.on("connect_error", connectionError);
  server_socket.on("connect_timeout", connectionError);
  server_socket.on("error", connectionError);

  // Job completed, store the results
  server_socket.on("completed", function(data) {
    server_socket.disconnect();

    var redis_packet = {
      type: "completed",
      msg: data
    };

    // Write to database
    self.job.analysis.status = "completed";

    if (data) {
      self.job.analysis.results = data.results;
      logger.info("job complete; got results");
    } else {
      logger.error("job complete, but no data received");
    }

    if (self.job.analysis.mail) {
      mailer.sendJobComplete(self.job.analysis);
    }

    //Update the status for the analysis
    self.job.analysis.save(function(err, result) {
      if (err) throw err;
      callback({ completed: true, msg: "Successful Results" });
    });
  });

  // If there is an error, abort the mission
  server_socket.on("script error", function(data) {
    server_socket.disconnect();
    self.handleError(data);
  });

  // Once connected to the server, prepare the request and spawn the item.
  server_socket.on("connected", function(data) {
    var stream = ss.createStream();
    ss(server_socket).emit("spawn", stream, {
      job: self.job,
      status_stack: self.job.status_stack
    });

    fs.createReadStream(self.job.filepath).pipe(stream);
  });
};

function JobQueue(callback) {
  this.initializeServer(callback);
}

/**
 * Initializes object
 */

JobQueue.prototype.initializeServer = function(callback) {
  var self = this;

  var server_socket = ioclient.connect(
    default_setup_url,
    {
      "connect timeout": 1000,
      "force new connection": true,
      reconnection: false
    }
  );

  var connectionError = function(err) {
    winston.warn(err);
    callback({ successful_connection: false, msg: err }, null);
    server_socket.disconnect();
  };

  server_socket.on("connect_error", connectionError);
  server_socket.on("connect_timeout", connectionError);
  server_socket.on("error", connectionError);

  // Once connected to the server, prepare the request and spawn the item.
  server_socket.on("connected", function(data) {
    server_socket.on("job queue", function(jobs) {
      callback(null, jobs);
      server_socket.disconnect();
    });

    server_socket.emit("job queue");
  });
};

exports.ClientSocket = ClientSocket;
exports.ClusterStatus = ClusterStatus;
exports.HPCSocket = HPCSocket;
exports.HPCSocketRecheck = HPCSocketRecheck;
exports.JobQueue = JobQueue;
