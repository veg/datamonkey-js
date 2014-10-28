function datamonkey_default_tree_settings(tree) {
    tree.branch_length (null);
    tree.branch_name (null);
    tree.node_span ('equal');
    tree.options ({'draw-size-bubbles' : false}, false);
}

function datamonkey_create_neighbor_tree() {

  var width                         = 800,
      height                        = 600,
      current_selection_name        = $("#selection_name_box").val(),
      current_selection_id          = 0,
      max_selections                = 10;
      color_scheme                  = d3.scale.category10(),
      selection_menu_element_action = "phylotree_menu_element_action";


  var valid_id = new RegExp ("^[\\w]+$");
  var top_modal_container = "#neighbor-tree-modal";
  var tree_container = "#tree-body";
  var newick_container = "#newick-body";
  var container_id = '#tree_container';

  $(newick_container).hide().removeClass('hide');

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


  datamonkey_default_tree_settings(tree);
  tree(nwk).svg(svg).layout();

  $('#newick-view').on('click', function (e) {
    $(newick_container).toggle()  
    $(tree_container).toggle()  
    if($("#newick-body").is(":visible")) {
      $(this).text("View Tree");
      $('#save-button').text("Save");
      $('#save-png-button').hide();
    } else {
      $(this).text("View Newick");
      $('#save-button').text("Save as SVG");
      $('#save-png-button').show();
    }
  });

  $('#save-button').on('click', function (e) {
    if($("#newick-body").is(":visible")) {
      datamonkey.helpers.save_newick_to_file();
    } else {
      datamonkey.helpers.save_newick_tree("svg");
    }
  });

  $('#save-png-button').on('click', function (e) {
    datamonkey.helpers.save_newick_tree("png");
  });

}

$( document ).ready( function () {
  datamonkey_create_neighbor_tree();
});
