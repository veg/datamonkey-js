function compute_shortest_paths(cluster, edges) {

  // Floyd-Warshall implementation
  var distances = {}

  var nodes =  cluster.nodes;
  node_ids = []
  nodes.forEach(function(n) { node_ids.push(n.id)});

  // Step 0: Filter edges that only exist within the cluster
  var new_edges = edges.filter(function(n) { 
    if( node_ids.indexOf(n.sequences[0]) != -1 && node_ids.indexOf(n.sequences[1]) != -1) {
      return true;
    } else {
      return false;
    }
   });

  // Step 1: Initialize distances
  nodes.forEach(function(n) { distances[n.id] = {} });
  nodes.forEach(function(n) { distances[n.id][n.id] = 0 });

  // Step 2: Initialize distances with edge weights
  new_edges.forEach(function(e){
    distances[e.sequences[0]] = {};
    distances[e.sequences[1]] = {};
  });

  new_edges.forEach(function(e){
    distances[e.sequences[0]][e.sequences[1]] = 1;
    distances[e.sequences[1]][e.sequences[0]] = 1;
  });

  // Step 3: Get shortest paths
  nodes.forEach(function(k) {
    nodes.forEach(function(i) {
      nodes.forEach(function(j) {
        if (i.id != j.id) {
          var d_ik = distances[k.id][i.id];
          var d_jk = distances[k.id][j.id];
          var d_ij = distances[i.id][j.id];
          if (d_ik != null &&  d_jk != null) {
            d_ik += d_jk;
            if ( d_ij == null || d_ij > d_ik ) {
              distances[i.id][j.id] = d_ik;
              distances[j.id][i.id] = d_ik;
            }
          }
        }
      });
    });
  });

  return distances;

}

function hivtrace_compute_mean_path(cluster_id, nodes, edges, cluster_sizes) {

  // Create a cluster object that is easy to deal with
  var unique_clusters = d3.set(nodes.map(function(d) { return d.cluster })).values();
  var cluster_map = {};
  unique_clusters.map(function(d){ cluster_map[d] = {'size': 0, 'nodes': [] } });

  //Add each node to the cluster
  Object.keys(cluster_map).map(function(d){
    cluster_map[d]['size'] = cluster_sizes[parseInt(d)-1];
  });

  nodes.map(function(d) { cluster_map[d.cluster]['nodes'].push(d) });

  // Compute the shortest paths according to Floyd-Warshall algorithm
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

function hivtrace_compute_node_degrees(obj) {

  var nodes = obj.Nodes,
      edges = obj.Edges;

  for (var n in nodes) {
    nodes[n].degree = 0;
  }
  
  for (var e in edges) {
    nodes[edges[e].source].degree++;
    nodes[edges[e].target].degree++;
  }

}


function hivtrace_is_contaminant(node) {
  return node.attributes.indexOf('problematic') != -1;
}

function hivtrace_convert_to_csv(obj) {
  //Translate nodes to rows, and then use d3.format
  //computeMeanPathLengths(obj.Nodes, obj.Edges)
  hivtrace_compute_node_degrees(obj);
  var node_array = obj.Nodes.map(function(d) {return [d.id, d.cluster, d.degree, hivtrace_is_contaminant(d), d.attributes.join(';')]});
  node_array.unshift(['seqid', 'cluster', 'degree', 'is_contaminant', 'attributes'])
  node_csv = d3.csv.format(node_array); 
  return node_csv;
}

function hivtrace_export_csv_button(graph, tag) {

  var data = hivtrace_convert_to_csv(graph);
  if (data != null) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(data));
    pom.setAttribute('download', 'export.csv');
    pom.className = 'btn btn-default btn-sm';
    pom.innerHTML = '<span class="glyphicon glyphicon-floppy-save"></span> Export Results';
    $(tag).append(pom);
  }

}

if(typeof datamonkey == 'undefined') {
  datamonkey = function () {};
}

if(typeof datamonkey.hivtrace == 'undefined') {
  datamonkey.hivtrace = function () {};
}

datamonkey.hivtrace.compute_node_degrees = hivtrace_compute_node_degrees;
datamonkey.hivtrace.compute_mean_path = hivtrace_compute_mean_path;
datamonkey.hivtrace.compute_node_mean_paths = hivtrace_compute_node_mean_paths;
datamonkey.hivtrace.export_csv_button = hivtrace_export_csv_button;
datamonkey.hivtrace.convert_to_csv = hivtrace_convert_to_csv;
