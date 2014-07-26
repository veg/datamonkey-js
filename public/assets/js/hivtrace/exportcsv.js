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

function convertToCSV(obj) {
  //Translate nodes to rows, and then use d3.format
  //computeNodeDegrees(obj.Nodes, obj.Edges)
  //computeMeanPathLengths(obj.Nodes, obj.Edges)
  //var node_array = obj.Nodes.map(function(d) {return [d.id, d.cluster, d.degree, d.mean_path_length]});
  var node_array = obj.Nodes.map(function(d) {return [d.id, d.cluster, d.degree]});
  node_array.unshift(['ID', 'Cluster', 'Degree'])
  node_csv = d3.csv.format(node_array); 
  return node_csv;
}

function exportCSVButton(graph, tag) {
    var data = convertToCSV(graph);
    if (data != null) {
      var pom = document.createElement('a');
      pom.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(data));
      pom.setAttribute('download', 'export.csv');
      pom.className = 'btn btn-default btn-lg';
      pom.innerHTML = '<span class="glyphicon glyphicon-floppy-save"></span> Export to CSV';
      pom.click();
      $(tag).append(pom);
    }
}
