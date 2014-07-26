function compute_shortest_paths(cluster, edges) {

  //// Floyd-Warshall implementation
  //var distances = {}

  //var nodes =  cluster.nodes;
  //node_ids = []
  //nodes.forEach(function(n) { node_ids.push(n.id)});

  //// Step 0: We need to filter out edges that only exist within the cluster
  //// we're looking at
  //var new_edges = edges.filter(function(n) { 
  //  if( node_ids.indexOf(n.sequences[0]) != -1 && node_ids.indexOf(n.sequences[1]) != -1) {
  //    return true;
  //  } else {
  //    return false;
  //  }
  // });

  //// Step 1: Initialize distances
  //nodes.forEach(function(n) { distances[n.id] = {} });
  //nodes.forEach(function(n) { distances[n.id][n.id] = 0 });

  //// Step 2: Initialize distances with edge weights
  //new_edges.forEach(function(e){
  //  distances[e.sequences[0]] = {};
  //  distances[e.sequences[1]] = {};
  //});

  //new_edges.forEach(function(e){
  //  distances[e.sequences[0]][e.sequences[1]] = 1;
  //  distances[e.sequences[1]][e.sequences[0]] = 1;
  //});

  //// Step 3: Get shortest paths
  //nodes.forEach(function(k) {
  //  nodes.forEach(function(i) {
  //    nodes.forEach(function(j) {
  //      if (i.id != j.id) {
  //        var d_ik = distances[k.id][i.id];
  //        var d_jk = distances[k.id][j.id];
  //        var d_ij = distances[i.id][j.id];
  //        if (d_ik != null &&  d_jk != null) {
  //          d_ik += d_jk;
  //          if ( d_ij == null || d_ij > d_ik ) {
  //            distances[i.id][j.id] = d_ik;
  //            distances[j.id][i.id] = d_ik;
  //          }
  //        }
  //      }
  //    });
  //  });
  //});

  return distances;

}

function compute_mean_path (cluster_id, nodes, edges, cluster_sizes) {

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

function compute_node_mean_paths(nodes, edges) {
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
