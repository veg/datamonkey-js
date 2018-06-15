var mongoose = require("mongoose"),
  moment = require("moment"),
  path = require("path"),
  hpcsocket = require(path.join(__dirname, "/../../lib/hpcsocket.js")),
  globals = require(path.join(__dirname, "/../../config/globals.js"));
  redis = require('redis'),
  client = redis.createClient({host : 'localhost', port : 6379});

var queueGet = require('../../lib/queue.js');


exports.homePage = function(req, res) {
  res.render("index.ejs");
};

exports.help = function(req, res) {
  res.render("help.ejs");
};

exports.development = function(req, res) {
  res.render("development.ejs");
};

exports.analyses = function(req, res) {
  res.render("analyses.ejs");
};

exports.copyright = function(req, res) {
  res.render("copyright.ejs");
};

// Decision tree that guides user to select right analysis for their hypothesis
exports.analysis_tree = function(req, res) {
  res.render("analysistree.ejs");
};

exports.data_privacy = function(req, res) {
  res.render("data.ejs");
};

exports.citations = function(req, res) {
  res.render("citations.ejs");
};


exports.jobQueue = function(req, res) {
  //This will set the queue cache when ran.
  queueGet(function(job_queue){
    var jobs = job_queue;
    res.format({
      json: function() {
        res.json(200, jobs);
      }
    });

  });
};


exports.jobQueuePage = function(req, res) {
  res.render("jobqueue.ejs");
};

exports.clusterhealth = function(req, res) {
  function connect_callback(result) {
    res.json(200, result);
  }

  var jobproxy = new hpcsocket.ClusterStatus(connect_callback);
};

exports.stats = function(req, res) {
  res.render("stats.ejs", { types: globals.types });
};

exports.stats_test = function(req, res) {
  res.render("stats_test.ejs", { types: globals.types });
};
