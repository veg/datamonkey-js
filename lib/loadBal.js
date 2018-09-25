var redis = require("redis"),
  _ = require("underscore"),
  setup = require("./../config/setup.js"),
  globals = require("./../config/globals.js");

// Use redis as our key-value store
var client = redis.createClient({ host: "localhost", port: 6379 });

//Reference for iteration variable used by function.
var redis_iteration = globals.redis_iteration;
var redis_current_url = globals.redis_current_url;
var cluster_ip_urls_array = setup.cluster_ip_urls_array;

function setInitialLoadBalanceKeys() {
  client.set(redis_iteration, 0);
  client.set(redis_current_url, cluster_ip_urls_array[0]);
}

//Main function
//Cycles through Redis iteration variable to pull urls[i]
function loadBalance(cluster_ip_urls_array, callback) {
  var err = null;

  client.get(redis_iteration, (err, data) => {
    if (err) {
      callback(err, null);
    }

    var return_url = cluster_ip_urls_array[data];
    if (_.isEmpty(return_url)) {
      callback("Return URL was empty", null);
      return;
    }

    client.set(redis_current_url, return_url);
    client.set(
      redis_iteration,
      (Number(data) + 1) % cluster_ip_urls_array.length,
      (err, reply) => {
        callback(err, return_url);
      }
    );
  });
}

exports.loadBalance = loadBalance;
exports.setInitialLoadBalanceKeys = setInitialLoadBalanceKeys;
