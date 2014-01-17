$(document).ready(function(){
  downloadExport();
});

function computeNodeDegrees (nodes, edges) {
  for (var n in nodes) {
    nodes[n].degree = 0;
  }
  
  for (var e in edges) {
    nodes[edges[e].source].degree++;
    nodes[edges[e].target].degree++;
  }
}

function computeMeanPathLength(nodes, edges) {

  for (var n in nodes) {
    nodes[n].totallength = 0;
  }

  for (var e in edges) {
    nodes[edges[e].source].totallength += edges[e].length;
    nodes[edges[e].target].totallength += edges[e].length;
  }

}

function convertToCSV(obj) {
  //Translate nodes to rows, and then use d3.format
  computeNodeDegrees(obj.Nodes, obj.Edges)
  computeMeanPathLength(obj.Nodes, obj.Edges)
  var node_array = obj.Nodes.map(function(d) {return [d.id, d.cluster, d.degree, d.totallength/d.degree]});
  node_array.unshift(['ID', 'Cluster', 'Degree', 'Mean Path Length'])
  node_csv = d3.csv.format(node_array); 
  return node_csv;
}

function exportCSV(callback) {
  var json_url = $('#network_tag').data('url');
  d3.json(json_url, function(obj) {
    callback(convertToCSV(obj));
  });
}

function downloadExport() {
  exportCSV(function(data) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(data));
    pom.setAttribute('download', 'export.csv');
    pom.className = 'btn btn-default btn-lg';
    pom.innerHTML = '<span class="glyphicon glyphicon-floppy-save"></span> Export to CSV';
    pom.click();
    $('#csvexport').append(pom);
  });
}
