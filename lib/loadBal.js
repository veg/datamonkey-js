var redis = require('redis');
// Use redis as our key-value store
var client = redis.createClient({host : 'localhost', port : 6379});
//Reference for iteration variable used by function.
var redis_iteration = "redis_loadBalance_iteration";
//Reference for underscore, used in helperCallback
var _ = require('underscore');
//This a variable place holder for URL array.
//var urls = ["www.1.com", "www.2.com", "www.3.com", "www.4.com"]; //replace this with URL array
var setup = require('./../config/setup.js');
var cluster_ip_urls_array = setup.cluster_ip_urls_array;
//Main function
//Cycles through Redis iteration variable to pull urls[i]

function loadBalance(cluster_ip_urls_array, callback){
  var err = null;
  client.get(redis_iteration, (err, data)=>{
    if(err){throw err;};
    var return_url = cluster_ip_urls_array[data]; //Replace this with URL Array
    client.set(redis_iteration, (Number(data) + 1) % cluster_ip_urls_array.length, function(err, reply){
      callback(err, return_url);
    });

    });
};

module.exports = loadBalance;
