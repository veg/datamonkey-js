$(document).ready(function(){
  if(!in_progress()) {
    initialize_cluster_network_graphs();
  }
});

function in_progress() {
  return $('.progress').length > 0;
}

var initialize_cluster_network_graphs = function () {

  var network_container     = '#network_tag',
      network_status_string = '#network_status_string',
      network_warning       = '#main-warning',
      histogram_tag         = '#histogram_tag',
      histogram_label       = '#histogram_label',
      csvexport_label       = '#csvexport';


  //Initialize clusternetworkgraph with json url
  var json_url = $(network_container).parent().data('url');
  
  d3.json(json_url, function(graph) {

    d3.json (window.location.href + "/attributes", function (error, attributes) {
          var user_graph = new clusterNetworkGraph(graph, network_container, network_status_string, network_warning, attributes);

          $('#expand-all-clusters').click(function(e) {
            user_graph.expand_all_clusters(e);
          });

          $('#collapse-all-clusters').click(function(e) {
            user_graph.collapse_all_clusters(e);
          });

          $('#toggle-hxb2').click(function(e) {
            if($(this).hasClass("active")) {
              $(this).text("Hide clusters with HXB2 links");
              user_graph.toggle_hxb2(false);
            } else {
              $(this).text("Show clusters with HXB2 links");
              user_graph.toggle_hxb2(true);
            }
            e.preventDefault();// prevent the default anchor functionality
          });


          exportCSVButton(graph, csvexport_label);
          render_histogram(graph, histogram_tag, histogram_label);
      });
  });

  if($('#lanl-trace-results').length > 0) {

    // Only if the comparison was done
    var lanl_network_container     = '#lanl-network_tag',
        lanl_network_status_string = '#lanl-network_status_string',
        lanl_network_warning       = '#lanl-main-warning',
        lanl_histogram_tag         = '#lanl-histogram_tag',
        lanl_histogram_label       = '#lanl-histogram_label',
        lanl_csvexport_label       = '#lanl-csvexport';

    var json_url = $(lanl_network_container).parent().data('url');
    d3.json(json_url, function(lanl_graph) {

      var lanl_graph_rendered = new clusterNetworkGraph(lanl_graph, lanl_network_container, lanl_network_status_string, lanl_network_warning);

      $('#lanl-expand-all-clusters').click(function(e) {
          lanl_graph_rendered.expand_all_clusters(e);
        });

      $('#lanl-collapse-all-clusters').click(function(e) {
          lanl_graph_rendered.collapse_all_clusters(e);
        });

        $('#lanl-toggle-hxb2').click(function(e) {
          if($(this).hasClass("active")) {
            $(this).text("Hide clusters with HXB2 links");
            lanl_graph_rendered.toggle_hxb2(false);
          } else {
            $(this).text("Show clusters with HXB2 links");
            lanl_graph_rendered.toggle_hxb2(true);
          }
          e.preventDefault();// prevent the default anchor functionality
        });


      render_histogram(lanl_graph, lanl_histogram_tag, lanl_histogram_label);
      exportCSVButton (lanl_graph, lanl_csvexport_label);
    });
  }
}
