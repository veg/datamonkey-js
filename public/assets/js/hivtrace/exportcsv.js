function computeNodeDegrees (nodes, edges) {
  for (var n in nodes) {
    nodes[n].degree = 0;
  }
  
  for (var e in edges) {
    nodes[edges[e].source].degree++;
    nodes[edges[e].target].degree++;
  }
}

function computeMeanPathLengths(nodes, edges) {
  compute_node_mean_paths(nodes, edges);
}

function convertToCSV(obj, callback) {
  //Translate nodes to rows, and then use d3.format
  computeNodeDegrees(obj.Nodes, obj.Edges)
  computeMeanPathLengths(obj.Nodes, obj.Edges)
  var node_array = obj.Nodes.map(function(d) {return [d.id, d.cluster, d.degree, d.mean_path_length]});
  node_array.unshift(['ID', 'Cluster', 'Degree', 'Mean Path Length'])
  node_csv = d3.csv.format(node_array); 
  callback(node_csv);
}
