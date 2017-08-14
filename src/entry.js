window.jQuery = window.$ = $; 

var io = require('socket.io-client');
window.io = io;
window._ = _;

require("font-awesome/css/font-awesome.css");
require('./less/bootstrap.less');
require("phylotree.css");

var datamonkey = require('./js/datamonkey.js');
datamonkey.helpers = require('./js/datamonkey_helpers.js');

var gard_form = require('jsx/forms/gard.jsx');
var slac_form = require('jsx/forms/slac.jsx');

window.gard_form = gard_form;
window.slac_form = slac_form;
window.datamonkey = datamonkey;
