function hivtrace_compute_mean_path(cluster_id, nodes, edges, cluster_sizes) {

  //TODO: Create a cluster attribute for the object to pass instead of an id

  // Create a cluster object that is easy to deal with
  var unique_clusters = d3.set(nodes.map(function(d) { return d.cluster })).values();
  var cluster_map = {};
  unique_clusters.map(function(d){ cluster_map[d] = {'size': 0, 'nodes': [] } });

  //Add each node to the cluster
  Object.keys(cluster_map).map(function(d){
    cluster_map[d]['size'] = cluster_sizes[parseInt(d)-1];
  });

  nodes.map(function(d) { cluster_map[d.cluster]['nodes'].push(d) });

  // Compute the shortst paths according to Floyd-Warshall algorithm
  var distances = compute_shortest_paths(cluster_map[cluster_id], edges);

  var path_sum = 0;

  //Sum all the distances and divide by the number of nodes
  Object.keys(distances).forEach( function(n) { 
    var node = nodes.filter(function(a_node){return a_node.id==n})
    Object.keys(distances[n]).forEach( function(k) {
      path_sum += distances[n][k];
    });
  });

  // Average Mean Path Calculation
  // l = (sum(distances))/(N(N-1))
  var node_len = cluster_map[cluster_id].nodes.length
  var mean_path_length = path_sum / (node_len * (node_len - 1));
  return mean_path_length;
}

function hivtrace_compute_node_mean_paths(nodes, edges) {

  //TODO: Create a cluster attribute for the object to pass instead of an id
  // Create a cluster object that is easy to deal with
  var unique_clusters = d3.set(nodes.map(function(d) { return d.cluster })).values();
  var cluster_map = {};
  unique_clusters.map(function(d){ cluster_map[d] = {'size': 0, 'nodes': [] } });

  ////Add each node to the cluster
  //Object.keys(cluster_map).map(function(d){
  //  cluster_map[d]['size'] = cluster_sizes[parseInt(d)-1];
  //});

  nodes.map(function(d) { cluster_map[d.cluster]['nodes'].push(d) });

  Object.keys(cluster_map).forEach( function(cluster_map_index) {
    // Compute the shortst paths according to Floyd-Warshall algorithm for each cluster
    var distances = compute_shortest_paths(cluster_map[cluster_map_index], edges);

    //Sum all the distances and divide by the number of nodes
    Object.keys(distances).forEach( function(n) { 
      var index=-1;
      for(var x=0;x<nodes.length;x++) {
        if(nodes[x].id===n) {
          index=x;
          break;
        }
      }
      var node = nodes[index];
      var path_sum = 0;
      var adj_nodes = Object.keys(distances[n]).length;
      Object.keys(distances[n]).forEach( function(k) {
        path_sum += distances[n][k];
      });
      node.mean_path_length = path_sum / adj_nodes;
    });
  });

}



function hivtrace_compute_node_degrees(nodes, edges) {
  for (var n in nodes) {
    nodes[n].degree = 0;
  }
  
  for (var e in edges) {
    nodes[edges[e].source].degree++;
    nodes[edges[e].target].degree++;
  }
}



function hiv_trace_export_table_to_text (parent_id, table_id, sep) {
  var the_button = d3.select (parent_id).append ("a")
                                        .attr ("target", "_blank")
                                        .on ("click", function (data, element) {   
                                            var table_tag = d3.select (this).attr ("data-table");
                                            var table_text = datamonkey.helpers.table_to_text (table_tag);
                                            datamonkey.helpers.export_handler (table_text, table_tag.substring (1) + ".tsv", "text/tab-separated-values");
                                        })
                                        .attr ("data-table", table_id);
                                        
  the_button.append ("i").classed ("fa fa-download fa-2x", true);
  return the_button;
                                        
                                        
}

function hivtrace_render_settings (settings, explanations) {
    d3.json (explanations, function (error, expl) {
        //console.log (settings);
    });
}

function hivtrace_format_value (value, formatter) {
    if (typeof value === 'undefined') {
        return "Not computed";
    }
    if (value === datamonkey.hivtrace.undefined) {
        return "Undefined";
    }
    if (value === datamonkey.hivtrace.too_large) {
        return "Size limit";
    }    
    
    return formatter ? formatter (value) : value;
}

datamonkey.hivtrace.compute_node_degrees = hivtrace_compute_node_degrees;
datamonkey.hivtrace.compute_mean_path = hivtrace_compute_mean_path;
datamonkey.hivtrace.compute_node_mean_paths = hivtrace_compute_node_mean_paths;
datamonkey.hivtrace.analysis_settings = hivtrace_render_settings;
datamonkey.hivtrace.export_table_to_text = hiv_trace_export_table_to_text;

datamonkey.hivtrace.undefined = new Object();
datamonkey.hivtrace.too_large = new Object();
datamonkey.hivtrace.format_value = hivtrace_format_value;