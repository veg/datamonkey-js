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
      network_status_string = '#network_status_string';
      histogram_tag         = '#histogram_tag',
      histogram_label       = '#histogram_label',
      csvexport_label       = '#csvexport';


  //Initialize clusternetworkgraph with json url
  var json_url = $(network_container).data('url');
  
  d3.json(json_url, function(graph) {
    d3.json (window.location.href + "/attributes", function (attributes, error) {
        clusterNetworkGraph(graph, network_container, network_status_string, attributes);
        //exportCSVButton(graph, csvexport_label);
        render_histogram(graph, histogram_tag, histogram_label);
    });
  });

  if($('#lanl-trace-results').length > 0) {

    // Only if the comparison was done
    var lanl_network_container     = '#lanl_network_tag',
        lanl_network_status_string = '#lanl_network_status_string';
        lanl_histogram_tag         = '#lanl_histogram_tag',
        lanl_histogram_label       = '#lanl_histogram_label',
        lanl_csvexport_label       = '#csvexport-lanl';

    var json_url = $(lanl_network_container).data('url');
    d3.json(json_url, function(graph) {
      clusterNetworkGraph(graph, lanl_network_container, lanl_network_status_string);
      //exportCSVButton(graph, lanl_csvexport_label);
      render_histogram(graph, lanl_histogram_tag, lanl_histogram_label);
    });
  }
}
