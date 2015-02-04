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
      button_bar_prefix     = 'network_ui_bar',
      csvexport_label       = '#csvexport',
      filter_edges_toggle   = '#network_ui_bar_toggle_filter_edges';

  //Initialize clusternetworkgraph with json url
  var json_url = $(network_container).parent().data('url');
  
  d3.json(json_url, function(graph) {

    d3.json (window.location.href + "/attributes", function (error, attributes) {
          var user_graph = new datamonkey.hivtrace.cluster_network_graph(graph, network_container, network_status_string, network_warning, button_bar_prefix, attributes, filter_edges_toggle);
          datamonkey.hivtrace.export_csv_button(graph, csvexport_label);
          datamonkey.hivtrace.histogram(graph, histogram_tag, histogram_label);
      });
  });

  if($('#lanl-trace-results').length > 0) {

    // Only if the comparison was done
    var lanl_network_container     = '#lanl-network_tag',
        lanl_network_status_string = '#lanl-network_status_string',
        lanl_network_warning       = '#lanl-main-warning',
        lanl_histogram_tag         = '#lanl-histogram_tag',
        lanl_histogram_label       = '#lanl-histogram_label',
        lanl_csvexport_label       = '#lanl-csvexport',
        lanl_button_bar_prefix     = 'lanl_network_ui_bar';


    var json_url = $(lanl_network_container).parent().data('url');
    d3.json(json_url, function(lanl_graph) {
      var lanl_graph_rendered = new datamonkey.hivtrace.cluster_network_graph(lanl_graph, lanl_network_container, lanl_network_status_string, lanl_network_warning, lanl_button_bar_prefix);
      datamonkey.hivtrace.histogram(lanl_graph, lanl_histogram_tag, lanl_histogram_label);
      datamonkey.hivtrace.export_csv_button(lanl_graph, lanl_csvexport_label);
    });
  }
}
