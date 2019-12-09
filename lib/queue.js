var path = require("path"),
  redis = require("redis"),
  hpcsocket = require(path.join(__dirname, "./hpcsocket.js")),
  winston = require("winston"),
  setup = require("../config/setup");

const client = redis.createClient({
  host: setup.redisHost,
  port: setup.redisPort
});
const jobQueueRedisKey = "jobQueue_" + setup.port;

function queueSet() {
  //This sets the queue cache when ran.
  new hpcsocket.JobQueue((err, job_queue) => {
    if (err) {
      winston.warn("hpcsocket had an error getting the jobQueue: " + err);
      return;
    }
    client.set(jobQueueRedisKey, JSON.stringify(job_queue), (err, reply) => {
      if (err) {
        winston.warn("redis client had an error setting the jobQueue: " + err);
        return;
      }
      return;
    });
  });
}

function queueGet(callback) {
  //This is used to get current redis queue cache.
  client.get(jobQueueRedisKey, (err, reply) => {
    if (err) {
      winston.warn("redis client had an error getting the jobQueue: " + err);
      callback(err, null);
      return;
    }
    try {
      callback(null, JSON.parse(reply));
    } catch (err) {
      callback(err, null);
    }
  });
}

exports.queueSet = queueSet;
exports.queueGet = queueGet;
