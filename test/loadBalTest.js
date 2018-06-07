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

//describe logic used for mocha tests
describe('loadBalance function: test iteration with string cross check', function() {

  it('Iterates and returns URLs correctly', function() {

    _.times(100, () => {
      return willRunloadBalance;
      }).reduce((p, f) => p.then(f), Promise.resolve())
      .then((return_url) => {
          //console.log(history);
          //assert.equal((_.intersection(history).length, urls.length));
          assert.equal((_.intersection(history, urls)).length, urls.length);
          });
  });
});
