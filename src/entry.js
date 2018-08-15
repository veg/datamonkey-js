window.jQuery = window.$ = $;

var io = require("socket.io-client");
window.io = io;

var _ = require("underscore");
window._ = _;

require("font-awesome/css/font-awesome.css");
require("./scss/application.scss");
require("phylotree.css");
require("blueimp-file-upload");

var hyphyVision = require("hyphy-vision");
require("hyphy-vision/dist/hyphyvision.css");

var datamonkey = require("./js/datamonkey.js");
datamonkey.helpers = require("./js/datamonkey_helpers.js");

var gard_form = require("jsx/forms/gard.jsx");
var slac_form = require("jsx/forms/slac.jsx");
var fubar_form = require("jsx/forms/fubar.jsx");
var render_branch_selection = require("jsx/branch-selection.jsx");
var stats = require("jsx/stats.jsx");
var analysis_tree = require("jsx/analysis_tree.jsx");
var jobqueue = require("jsx/jobqueue.jsx");
var render_attribute_modal = require("jsx/attribute_table.jsx");
var render_citations = require("jsx/citations.jsx");
var render_help = require("jsx/help.jsx");

window.gard_form = gard_form;
window.slac_form = slac_form;
window.fubar_form = fubar_form;
window.render_branch_selection = render_branch_selection;
window.datamonkey = datamonkey;
window.hyphyVision = hyphyVision;
window.datamonkey_stats = stats;
window.datamonkey_analysis_tree = analysis_tree;
window.datamonkey_jobqueue = jobqueue;
window.render_attribute_modal = render_attribute_modal;
window.render_citations = render_citations;
window.render_help = render_help;
