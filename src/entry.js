window.jQuery = window.$ = $;

const io = require("socket.io-client");
window.io = io;

const _ = require("underscore");
window._ = _;

require("bootstrap");
require("./scss/application.scss");
require("phylotree.css");
require("blueimp-file-upload");

var datamonkey = require("./js/datamonkey.js");
datamonkey.helpers = require("./js/datamonkey_helpers.js");

const hyphyVision = require("hyphy-vision");
const gard_form = require("jsx/forms/gard.jsx");
const multihit_form = require("jsx/forms/multihit.jsx");
const slac_form = require("jsx/forms/slac.jsx");
const contrast_fel_form = require("jsx/forms/contrast-fel.jsx");
const fubar_form = require("jsx/forms/fubar.jsx");
const fade_form = require("jsx/forms/fade.jsx");
const bgm_form = require("jsx/forms/bgm.jsx");
const render_branch_selection = require("jsx/branch-selection.jsx");
const render_multibranch_selection = require("jsx/multibranch-selection.jsx");
const datamonkey_branch_selection = require("js/datamonkey_branch_selection");
const stats = require("jsx/stats.jsx");
const analysis_tree = require("jsx/analysis_tree.jsx");
const jobqueue = require("jsx/jobqueue.jsx");
const render_attribute_modal = require("jsx/attribute_table.jsx");
const render_citations = require("jsx/citations.jsx");
const render_help = require("jsx/help.jsx");
const render_stdOut = require("jsx/job_log.jsx");
const render_api = require("jsx/apikey.jsx");

window.gard_form = gard_form;
window.multihit_form = multihit_form;
window.slac_form = slac_form;
window.contrast_fel_form = contrast_fel_form;
window.fubar_form = fubar_form;
window.fade_form = fade_form;
window.bgm_form = bgm_form;
window.datamonkey_branch_selection = datamonkey_branch_selection;
window.datamonkey = datamonkey;
window.hyphyVision = hyphyVision;
window.datamonkey_stats = stats;
window.datamonkey_analysis_tree = analysis_tree;
window.datamonkey_jobqueue = jobqueue;
window.render_attribute_modal = render_attribute_modal;
window.render_branch_selection = render_branch_selection;
window.render_multibranch_selection = render_multibranch_selection;
window.render_citations = render_citations;
window.render_help = render_help;
window.render_stdOut = render_stdOut;
window.render_api = render_api;
