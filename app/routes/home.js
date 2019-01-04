var mongoose = require("mongoose"),
  moment = require("moment"),
  path = require("path"),
  hpcsocket = require(path.join(__dirname, "/../../lib/hpcsocket.js")),
  globals = require(path.join(__dirname, "/../../config/globals.js"));
(redis = require("redis")),
  (client = redis.createClient({ host: "localhost", port: 6379 }));

var queue = require("../../lib/queue.js");

var setup = require("./../../config/setup.js");
var cluster_ip_urls_array = setup.cluster_ip_urls_array;

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
  queue.queueGet(function(err, job_queue) {
    if (err) {
      res.json(500, { err: err });
    } else {
      res.format({
        json: function() {
          res.json(200, job_queue);
        }
      });
    }
  });
};

exports.jobQueuePage = function(req, res) {
  res.render("jobqueue.ejs");
};

exports.clusterhealth = function(req, res) {
  function connect_callback(result) {
    res.json(200, result);
  }

  //console.log(cluster_ip_urls_array[req.params.id])
  new hpcsocket.ClusterStatus(
    cluster_ip_urls_array[req.params.id],
    connect_callback
  );
};

exports.stats = function(req, res) {
  res.render("stats.ejs", { types: globals.types });
};

exports.stats_test = function(req, res) {
  res.render("stats_test.ejs", { types: globals.types });
};
