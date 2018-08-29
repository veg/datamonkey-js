var assert = require('assert');
var loadBalance = require('./../lib/loadBal.js');
var _ = require('underscore');

//var urls = ["www.1.com", "www.2.com", "www.3.com", "www.4.com"]; //replace this with URL array
var setup = require('./../config/setup.js');
var urls = setup.cluster_ip_urls_array;
var history = [];


//Promise logic used to loop function within describe function
const willRunloadBalance = () => {
  return new Promise((resolve, reject) => {
    loadBalance(urls, (err, return_url) => {
      if (err) {
        reject("Error in loadBalance");
      } else {
        history.push(return_url);
        resolve(return_url);
      }
    });
  });
};

describe('loadBalance function: test iteration with string cross check', function() {

  it('Iterates and returns URLs correctly', function() {

    _.times(100, () => {
      return willRunloadBalance;
      }).reduce((p, f) => p.then(f), Promise.resolve())
      .then((return_url) => {
          assert.equal((_.intersection(history, urls)).length, urls.length);
          });
  });
});

describe('loadBalance function: single string cross check', function() {

  it('Returns one string that is cross referenced with URLs array', function(){
    loadBalance(urls, (err, return_url) => {
      var history = [return_url];
      assert.equal((_.intersection(history, urls)).length, 1);
    })

  });
});
