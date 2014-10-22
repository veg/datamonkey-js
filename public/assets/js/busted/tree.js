$( document ).ready( function () {
  createNeighborTree();
});

function getStyles(doc) {
  var styles = "",
      styleSheets = doc.styleSheets;

  if (styleSheets) {
    for (var i = 0; i < styleSheets.length; i++) {
      processStyleSheet(styleSheets[i]);
    }
  }

  function processStyleSheet(ss) {
    if (ss.cssRules) {
      for (var i = 0; i < ss.cssRules.length; i++) {
        var rule = ss.cssRules[i];
        if (rule.type === 3) {
          // Import Rule
          processStyleSheet(rule.styleSheet);
        } else {
          // hack for illustrator crashing on descendent selectors
          if (rule.selectorText) {
            if (rule.selectorText.indexOf(">") === -1) {
              styles += "\n" + rule.cssText;
            }
          }
        }
      }
    }
  }
  return styles;
}

function default_tree_settings (tree) {
    tree.branch_length (null);
    tree.branch_name (null);
    tree.node_span ('equal');
    tree.options ({'draw-size-bubbles' : false}, false);
}

function saveNewickToFile() {
  var top_modal_container = "#neighbor-tree-modal";
  var nwk = $(top_modal_container).data("tree");
  var pom = document.createElement('a');
  pom.setAttribute('href', 'data:text/octet-stream;charset=utf-8,' + encodeURIComponent(nwk));
  pom.setAttribute('download', 'nwk.txt');
  $("body").append(pom);
  pom.click();
  pom.remove();
}


function convertSVGtoPNG(image_string) {
  var image = document.getElementById("image");
  image.src = image_string;

  image.onload = function() {
    var canvas = document.getElementById("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    var context = canvas.getContext("2d");
    context.fillStyle = "#FFFFFF";
    context.fillRect(0,0,image.width,image.height);
    context.drawImage(image, 0, 0);
    var img = canvas.toDataURL("image/png");

    var pom = document.createElement('a');
    pom.setAttribute('download', 'phylotree.png');
    pom.href = canvas.toDataURL("image/png");     
    $("body").append(pom);
    pom.click();
    pom.remove();
  }
}

function saveNewickTree(type) {

  var prefix = {
    xmlns: "http://www.w3.org/2000/xmlns/",
    xlink: "http://www.w3.org/1999/xlink",
    svg: "http://www.w3.org/2000/svg"
  }

  var tree_container = "#tree_container";
  var svg = $("#tree_container").find("svg")[0];
  var styles = getStyles(window.document);

  svg.setAttribute("version", "1.1");

  var defsEl = document.createElement("defs");
  svg.insertBefore(defsEl, svg.firstChild); 

  var styleEl = document.createElement("style")
  defsEl.appendChild(styleEl);
  styleEl.setAttribute("type", "text/css");


  // removing attributes so they aren't doubled up
  svg.removeAttribute("xmlns");
  svg.removeAttribute("xlink");

  // These are needed for the svg
  if (!svg.hasAttributeNS(prefix.xmlns, "xmlns")) {
    svg.setAttributeNS(prefix.xmlns, "xmlns", prefix.svg);
  }

  if (!svg.hasAttributeNS(prefix.xmlns, "xmlns:xlink")) {
    svg.setAttributeNS(prefix.xmlns, "xmlns:xlink", prefix.xlink);
  }

  var source = (new XMLSerializer()).serializeToString(svg).replace('</style>', '<![CDATA[' + styles + ']]></style>');
  var rect = svg.getBoundingClientRect();
  var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
  var to_download = [doctype + source]
  var image_string = 'data:image/svg+xml;base66,' + encodeURIComponent(to_download);

  if(type == "png") {
    convertSVGtoPNG(image_string)
  } else {
    var pom = document.createElement('a');
    pom.setAttribute('download', 'phylotree.svg');
    pom.setAttribute('href', image_string);
    $("body").append(pom);
    pom.click();
    pom.remove();
  }

}

function createNeighborTree() {

  var width                         = 800,
      height                        = 600,
      current_selection_name        = $("#selection_name_box").val(),
      current_selection_id          = 0,
      max_selections                = 10;
      color_scheme                  = d3.scale.category10(),
      selection_menu_element_action = "phylotree_menu_element_action";


  var valid_id = new RegExp ("^[\\w]+$");
  var top_modal_container = "#neighbor-tree";
  var tree_container = "#tree-body";
  var container_id = '#tree_container';

  nwk = $(top_modal_container).data("tree");
      
  tree = d3.layout.phylotree(tree_container)
      .size([height, width])
      .separation (function (a,b) {return 0;})
      .count_handler (function (count) { 
              $("#selected_branch_counter").text(function (d) {return count[current_selection_name];}); 
              $("#selected_filtered_counter").text(count.tag);
          }
      );

  var svg = d3.select(container_id).append("svg")
      .attr("width", width)
      .attr("height", height),
      svg_defs = svg.append ("defs");


  default_tree_settings(tree);
  tree(nwk).svg(svg).layout();

}

// TODO: Internalize this method
function exportNewick(tree) {
  return tree.get_newick (
    function (node) {
      var tags = [];
      if (node.selected) { tags.push("FG") };
      if (tags.length) {
        return '{' + tags.join (',') + '}';
      }
      return '';
    }
  )
}

function validateSelection(tree, callback) {

  if(tree.nodes.get_selection().length) {
    callback();
  } else {
    callback({ msg : 'No branch selections were made, please select one. Alternatively, you can choose to select all via the menu.'});
  }
}


$("form").submit(function(e) {

  e.preventDefault();
  var self = this;

  validateSelection(tree, function(err) {

    if(err) {
      Datamonkey.errorModal(err.msg);
    } else {
      var formData = new FormData();
      var nwk_tree = exportNewick(tree);

      formData.append('nwk_tree', nwk_tree);

      var xhr = new XMLHttpRequest();
      xhr.open('post', self.attributes.getNamedItem("action").value, true);
      xhr.onload = function(res) {
        // Replace field with green text, name of file
        var result = JSON.parse(this.responseText);
        if('_id' in result.busted) {
          window.location.href =  '/busted/' + result.busted._id;
        } else if ('error' in result) {
          //TODO
        }
      };

      xhr.send(formData);
    }

  });

});

$("#expand_spacing").on("click", function (e) {
  tree.spacing_x (tree.spacing_x() + 1).update(true);
});

$("#compress_spacing").on ("click", function (e) {
  tree.spacing_x (tree.spacing_x() - 1).update(true);
})

$("#color_or_grey").on ("click", function (e) {
  if ($(this).data ('color-mode') == 'gray') {
      $(this).data ('color-mode', 'color');
      d3.select (this).text ("Use grayscale");
      omega_color.range([ "#5e4fa2", "#3288bd", "#e6f598","#f46d43","#9e0142"]);
  } else {
      $(this).data ('color-mode', 'gray');
      d3.select (this).text ("Use color");
      omega_color.range(["#EEE", "#BBB","#999","#333","#000"]);    
  }
  branch_omegas = render_bs_rel_tree (analysis_data, which_model)[1];
  tree.update ();
  e.preventDefault();
});


function sort_nodes (asc) {
    tree.traverse_and_compute (function (n) {
            var d = 1;
            if (n.children && n.children.length) {
                d += d3.max (n.children, function (d) { return d["count_depth"];});
            }
            n["count_depth"] = d;
        }); 
        tree.resort_children (function (a,b) {
            return (a["count_depth"] - b["count_depth"]) * (asc ? 1 : -1);
        });
}

$("#sort_original").on ("click", function (e) {
    tree.resort_children (function (a,b) {
        return a["original_child_order"] - b["original_child_order"];
    });
});

$("#sort_ascending").on ("click", function (e) {
    sort_nodes (true);
});

$("#sort_descending").on ("click", function (e) {
    sort_nodes (false);
});

$("#and_label").on ("click", function (e) {
    tree.internal_label (function (d) { return d.reduce (function (prev, curr) { return curr[current_selection_name] && prev; }, true)}, true);
});

$("#or_label").on ("click", function (e) {
    tree.internal_label (function (d) { return d.reduce (function (prev, curr) { return curr[current_selection_name] || prev; }, false)}, true);
});

$("#filter_remove").on("click", function (e) {
    tree.modify_selection (function (d) { return !d.tag;});
});

$("#select_all").on("click", function (e) {
    tree.modify_selection (function (d) { return true;});
});

$("#select_all_internal").on("click", function (e) {
    tree.modify_selection (function (d) { return !d3_phylotree_is_leafnode (d.target);});
});

$("#select_all_leaves").on("click", function (e) {
    tree.modify_selection (function (d) { return d3_phylotree_is_leafnode (d.target);});
});


$("#select_none").on("click", function (e) {
    tree.modify_selection (function (d) { return false;});
});

$("#display_dengrogram").on("click", function (e) {
    tree.options ({'branches' : 'step'}, true);
});


