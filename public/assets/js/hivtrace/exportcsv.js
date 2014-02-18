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

function computeMeanPathLengthPerCluster(nodes, edges, cluster_sizes) {

  for (var n in nodes) {
    nodes[n].totallength = 0;
  }

  for (var e in edges) {
    nodes[edges[e].source].totallength += edges[e].length;
  }

  // Get unique cluster ids
  var unique_clusters = d3.set(nodes.map(function(d) { return d.cluster })).values();
  var cluster = {};

  unique_clusters.map(function(d){ cluster[d] = {'length': 0, 'size': 0, 'mean': 0 } });
  nodes.map(function(d) { cluster[d.cluster]['length'] += d.totallength });
  Object.keys(cluster).map(function(d){
    cluster[d]['size'] = cluster_sizes[parseInt(d)-1];
    cluster[d]['mean'] = cluster[d]['length']/cluster[d]['size'];
  });

  return cluster

}

function convertToCSV(obj) {
  //Translate nodes to rows, and then use d3.format
  computeNodeDegrees(obj.Nodes, obj.Edges)
  var node_array = obj.Nodes.map(function(d) {return [d.id, d.cluster, d.degree]});
  node_array.unshift(['ID', 'Cluster', 'Degree'])
  node_csv = d3.csv.format(node_array); 
  return node_csv;
}

function exportCSV(tag, callback) {
  var json_url = $(tag).data('url');
  if (json_url) {
    d3.json(json_url, function(obj) {
      callback(convertToCSV(obj));
    });
  } else {
    return null;
  }
}

function downloadExport() {
  exportCSV('#network_tag', function(data) {
    if (data != null) {
      var pom = document.createElement('a');
      pom.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(data));
      pom.setAttribute('download', 'export.csv');
      pom.className = 'btn btn-default btn-lg';
      pom.innerHTML = '<span class="glyphicon glyphicon-floppy-save"></span> Export to CSV';
      pom.click();
      $('#csvexport').append(pom);
    }
  });

  exportCSV('#lanl_network_tag', function(data) {
    if (data != null) {
      var pom = document.createElement('a');
      pom.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(data));
      pom.setAttribute('download', 'export.csv');
      pom.className = 'btn btn-default btn-lg';
      pom.innerHTML = '<span class="glyphicon glyphicon-floppy-save"></span> Export to CSV';
      pom.click();
      $('#csvexport-lanl').append(pom);
    }
  });

}

