var assert = require('assert');
var loadBalance = require('./../lib/loadBal.js');
var _ = require('underscore');
var setup = require('./../config/setup.js');
var cluster_ip_urls_array = setup.cluster_ip_urls_array;


describe('loadBalance function: single string cross check', function() {
  var history = [];
  //var urls = ["www.1.com", "www.2.com", "www.3.com", "www.4.com"]; //replace this with URL array
  it('Returns one string that is cross referenced with URLs array', function(){
    loadBalance(cluster_ip_urls_array, (err, return_url) => {
      history.push(return_url);
      assert.equal((_.intersection(history, urls)).length, 1);
    })

  });
});
