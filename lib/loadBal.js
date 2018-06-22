var redis = require('redis');
// Use redis as our key-value store
var client = redis.createClient({host : 'localhost', port : 6379});
//Reference for iteration variable used by function.
var redis_iteration = "redis_loadBalance_iteration";
var redis_current_url = "redis_loadBalance_url";
var setup = require('./../config/setup.js');
var cluster_ip_urls_array = setup.cluster_ip_urls_array;

//Main function
//Cycles through Redis iteration variable to pull urls[i]

function loadBalance(cluster_ip_urls_array, callback){
  var err = null;

  client.get(redis_iteration, (err, data)=>{
    if(err){callback(err, null);};
    var return_url = cluster_ip_urls_array[data];
    client.set(redis_current_url, return_url);
    client.set(redis_iteration, (Number(data) + 1) % cluster_ip_urls_array.length, (err, reply)=>{
      callback(err, return_url);
     });
   });
};

module.exports = loadBalance;
