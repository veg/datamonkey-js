var path = require("path"),
    redis = require('redis'),
    client = redis.createClient({host : 'localhost', port : 6379}),
    hpcsocket = require(path.join(__dirname, "./hpcsocket.js"));


function queueSet(callback){
  //This sets the queue cache when ran.
  client.get("jobQueue", (err, redis_queue)=>{
      new hpcsocket.JobQueue((err, job_queue)=> {
        client.set("jobQueue", JSON.stringify(job_queue), (err, reply) => {
          callback(job_queue);
        });
      });
  });
};


function queueGet(callback){
  //This is used to get current redis queue cache.
  client.get("jobQueue", (err, reply)=>{
    if (err){callback(null);};
    callback(reply);
  });
};

module.exports = queueSet,
                 queueGet;
