var path = require("path"),
  redis = require("redis"),
  client = redis.createClient({ host: "localhost", port: 6379 }),
  hpcsocket = require(path.join(__dirname, "./hpcsocket.js")),
  setup = require("./../config/setup");

const jobQueueRedisKey = "jobQueue_"+setup.port;

function queueSet(callback) {
  //This sets the queue cache when ran.
  new hpcsocket.JobQueue((err, job_queue) => {
    client.set(jobQueueRedisKey, JSON.stringify(job_queue), (err, reply) => {
      if (err) {
        callback(null);
      }
      callback(job_queue);
    });
  });
}

function queueGet(callback) {
  //This is used to get current redis queue cache.
  client.get(jobQueueRedisKey, (err, reply) => {
    if (err) {
      callback(null);
    }
    callback(reply);
  });
}

exports.queueSet = queueSet;
exports.queueGet = queueGet;
