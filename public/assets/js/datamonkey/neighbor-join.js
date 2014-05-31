var width                         = 800,
    height                        = 600,
    current_selection_name        = $("#selection_name_box").val(),
    current_selection_id          = 0,
    max_selections                = 10;
    color_scheme                  = d3.scale.category10(),
    selection_menu_element_action = "phylotree_menu_element_action";

function default_tree_settings (tree) {
    tree.branch_length (null);
    tree.branch_name (null);
    tree.node_span ('equal');
    tree.options ({'draw-size-bubbles' : false}, false);
    //tree.style_nodes (node_colorizer);
    //tree.style_edges (edge_colorizer);
    //tree.selection_label(current_selection_name);
}

function node_colorizer (element, data) {
  try {
     var count_class = 0;
      selection_set.forEach (function (d,i) { if (data[d]) {count_class ++; element.style ("fill", color_scheme(i), i == current_selection_id ?  "important" : null);}});
      if (count_class == 0) {        
          element.style ("fill", null);
      }
  } 
  catch (e) {}

}

function edge_colorizer (element, data) {
  try {
      var count_class = 0;
      selection_set.forEach (function (d,i) { if (data[d]) {count_class ++; element.style ("stroke", color_scheme(i), i == current_selection_id ?  "important" : null);}});
     
      if (count_class > 1) {
          element.classed ("branch-multiple", true);
      } else 
      if (count_class == 0) {        
               element.style ("stroke", null)
                     .classed ("branch-multiple", false);
      }
  } 
  catch (e) {
  }
      
}

function createNeighborTree() {
  var valid_id = new RegExp ("^[\\w]+$");
  var top_modal_container = "#neighbor-tree-modal";
  var tree_container = "#tree-body";
  var container_id = '#tree_container';

  nwk = $(top_modal_container).data("tree");
      
  var tree = d3.layout.phylotree(tree_container)
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

$( document ).ready( function () {
  createNeighborTree();
});
