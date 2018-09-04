var render_branch_selection = require("./../jsx/branch-selection.jsx");

$(document).ready(function() {
  var top_modal_container = "#neighbor-tree";
  var nj_nwk = $(top_modal_container).data("tree");
  var user_tree_nwk = $(top_modal_container).data("usertree");
});

var top_modal_container = "#neighbor-tree";
var nj_nwk = "((me, you), them)";

function datamonkeyAnnotatedTreeCallback(nwk_tree) {
  var formData = new FormData();
  formData.append("nwk_tree", nwk_tree);

  var xhr = new XMLHttpRequest();
  xhr.open("post", self.attributes.getNamedItem("action").value, true);
  xhr.onload = function(res) {
    // Replace field with green text, name of file
    var result = JSON.parse(this.responseText);
    if ("_id" in result.absrel) {
      window.location.href = "/absrel/" + result.absrel._id;
    } else if ("error" in result) {
      alert(result.error);
    }
  };
  xhr.send(formData);
}

function datamonkey_branch_selection(element, height, width, testAndReference) {
  render_branch_selection(
    element,
    null,
    nj_nwk,
    datamonkeyAnnotatedTreeCallback,
    height,
    width,
    testAndReference
  );
}

module.exports = datamonkey_branch_selection;
