$( document ).ready( function () {

  // If there is a user tree, allow the user to select which they want to use
  var top_modal_container = "#neighbor-tree";
  nj_nwk = $(top_modal_container).data("tree");
  user_tree_nwk = $(top_modal_container).data("usertree");

  if(user_tree_nwk) {
    busted_create_neighbor_tree(user_tree_nwk);
  } else {
    busted_create_neighbor_tree(nj_nwk);
  }

  if("#tree-select-btn-group") {
    $("#tree-select-btn-group").find('.btn').each(
      function(i, obj){
        $(obj).on('click', function(d) { 
          d3.select('#tree_container').html('');
          current_selection_name = $(this).data('name');
          if(current_selection_name == 'nj') {
            busted_create_neighbor_tree(nj_nwk);
          } else {
            busted_create_neighbor_tree(user_tree_nwk);
          }
        })
    });
  }

});

function busted_create_neighbor_tree(nwk) {

  var default_tree_settings = function(tree) {
      tree.branch_length (null);
      tree.branch_name (null);
      tree.node_span ('equal');
      tree.options ({'draw-size-bubbles' : false}, false);
      tree.options({'left-right-spacing': 'fit-to-size'});
  }


  var width                         = 800,
      height                        = 600,
      current_selection_name        = $("#selection_name_box").val(),
      current_selection_id          = 0,
      max_selections                = 10,
      color_scheme                  = d3.scale.category10(),
      selection_menu_element_action = "phylotree_menu_element_action";


  var valid_id = new RegExp ("^[\\w]+$"),
      top_modal_container = '#neighbor-tree',
      tree_container = '#tree-body',
      container_id = '#tree_container';
      
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
      svg_defs = svg.append("defs");

  default_tree_settings(tree);
  tree(nwk).svg(svg).layout();
  _.delay(tree.placenodes().update, 100);

}

$("form").submit(function(e) {

  e.preventDefault();
  var self = this;

  var validate_selection = function(tree, callback) {

    if(tree.nodes.get_selection().length) {
      callback();
    } else {
      callback({ msg : 'No branch selections were made, please select one. Alternatively, you can choose to select all via the menu.'});
    }
  }

  var export_newick = function(tree) {
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

  validate_selection(tree, function(err) {
    if(err) {
      datamonkey.errorModal(err.msg);
    } else {
      var formData = new FormData();
      var nwk_tree = export_newick(tree);
      formData.append('nwk_tree', nwk_tree);

      var xhr = new XMLHttpRequest();
      xhr.open('post', self.attributes.getNamedItem("action").value, true);
      xhr.onload = function(res) {

        // Replace field with green text, name of file
        var result = JSON.parse(this.responseText);
        if(_.has(result.busted, '_id')) {
          window.location.href =  '/busted/' + result.busted._id;
        } else if ('error' in result) {
          datamonkey.errorModal(result.error);
        }

      };
      xhr.send(formData);
    }
  });

});

$("#expand_spacing").on("click", function (e) {
  tree.spacing_x(tree.spacing_x() + 1).update(true);
});

$("#compress_spacing").on ("click", function (e) {
  tree.spacing_x(tree.spacing_x() - 1).update(true);
})

$("#color_or_grey").on("click", function (e) {
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


function sort_nodes(asc) {
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
  sort_nodes(true);
});

$("#sort_descending").on ("click", function (e) {
    sort_nodes(false);
});

$("#and_label").on("click", function (e) {
    tree.internal_label (function (d) { return d.reduce (function (prev, curr) { return curr[current_selection_name] && prev; }, true)}, true);
});

$("#or_label").on("click", function (e) {
    tree.internal_label (function (d) { return d.reduce (function (prev, curr) { return curr[current_selection_name] || prev; }, false)}, true);
});

$("#filter_remove").on("click", function (e) {
    tree.modify_selection (function (d) { return !d.tag;});
});

$("#select_all").on("click", function (e) {
    tree.modify_selection(function (d) { return true;});
});

$("#select_all_internal").on("click", function (e) {
    tree.modify_selection(function (d) { return !d3_phylotree_is_leafnode (d.target);});
});

$("#select_all_leaves").on("click", function (e) {
    tree.modify_selection(function (d) { return d3_phylotree_is_leafnode (d.target);});
});


$("#select_none").on("click", function (e) {
    tree.modify_selection(function (d) { return false;});
});

$("#display_dengrogram").on("click", function (e) {
    tree.options({'branches' : 'step'}, true);
});

