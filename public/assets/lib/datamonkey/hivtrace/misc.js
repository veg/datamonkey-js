function hivtrace_cluster_adjacency_list(obj) {

  var nodes = obj.Nodes,
      edges = obj.Edges;


  var adjacency_list = {};

  edges.forEach(function(e, i) {

    function in_nodes(n, id) {
      return n.id == id;
    }

    var seq_ids = e["sequences"];

    var n1 = nodes.filter(function(n) { return in_nodes(n, seq_ids[0]) })[0],
        n2 = nodes.filter(function(n) { return in_nodes(n, seq_ids[1]) })[0];

    adjacency_list[n1.id] ? adjacency_list[n1.id].push(n2) : adjacency_list[n1.id] = [n2];
    adjacency_list[n2.id] ? adjacency_list[n2.id].push(n1) : adjacency_list[n2.id] = [n1];

  });


  return adjacency_list;

}

// Reconstructs path from floyd-warshall algorithm
function hivtrace_get_path(next, i, j) {

  var all_paths = [];
  var i = parseInt(i);
  var j = parseInt(j);

  for (var c = 0; c < next[i][j].length; c++) {

    var k = next[i][j][c];
    var intermediate = k;

    if(intermediate == null || intermediate == i) {
      return [[parseInt(i), parseInt(j)]];
    } else {

      var paths_i_k = hivtrace_get_path(next, i, intermediate);
      var paths_k_j = hivtrace_get_path(next, intermediate, j);

      for (var i_k_index=0; i_k_index < paths_i_k.length; i_k_index++) {
        var i_k = paths_i_k[i_k_index];
        for (var k_j_index=0; k_j_index < paths_k_j.length; k_j_index++) {
          var k_j = paths_k_j[k_j_index];
          if(i_k.length) {
            if((i_k[0] == i) && (i_k[i_k.length - 1] == k) && (k_j[0] == k) && (k_j[k_j.length - 1] == j)) {
              i_k.pop()
              all_paths.push(i_k.concat(k_j));
            }
          }
        }
      }
    }
  }

  return all_paths;

}

function hivtrace_paths_with_node(node, next, i, j) {

  var paths = hivtrace_get_path(next, i, j);

  // Retrieve intermediary paths
  //console.log(paths);
  paths = paths.map(function(sublist){ return sublist.slice(1, -1) });

  if(!paths) {
    return 0;
  }

  var num_nodes = [];

  for (var i = 0; i < paths.length; i++) {
    sublist = paths[i];
    num_nodes.push(d3.sum(sublist.map(function(n) { return n == node; })));
  }  

  var mean = d3.mean(num_nodes);

  if (mean == undefined) {
    mean = 0;
  }

  //console.log(mean);

  return mean;

}


// Same as compute shortest paths, but with an additional next parameter for reconstruction
function hivtrace_compute_shortest_paths_with_reconstruction(obj, subset, use_actual_distances) {

  // Floyd-Warshall implementation
  var distances = [];
  var next = [];
  var nodes =  obj.Nodes;
  var edges =  obj.Edges;
  var node_ids = [];

  //nodes.forEach( function(n) { return node_ids.push(n.id); } );
  var adjacency_list = datamonkey.hivtrace.cluster_adjacency_list(obj);

  if(!subset) {
    subset = Object.keys(adjacency_list);
  }

  var node_count = subset.length;

  for(var i=0; i<subset.length; i++) {
    var a_node = subset[i];
    var empty_arr = _.range(node_count).map(function(d) { return null });
    var zeroes = _.range(node_count).map(function(d) { return null });
    distances.push(zeroes);
    next.push(empty_arr);
  };

  for(var index=0; index<subset.length; index++) {
    var a_node=subset[index];
    for(var index2=0; index2<subset.length; index2++) {
      var second_node = subset[index2];
      if (second_node != a_node) {
        if (adjacency_list[a_node].map(function(n) { return n.id}).indexOf(second_node) != -1) {
          distances[index][index2] = 1;
          distances[index2][index] = 1;
        }
      }
    }
  }

  for(var index_i=0; index_i<subset.length; index_i++) {
    var n_i = subset[index_i];
    for(var index_j=0; index_j<subset.length; index_j++) {
      var n_j = subset[index_j];
      if (index_i == index_j) {
        next[index_i][index_j] = [];
      } else {
        next[index_i][index_j] = [index_i];
      }
    }
  }

  // clone distances
  var distances2 = _.map(distances, _.clone); 
  var c = 0;

  for(var index_k=0;index_k<subset.length;index_k++) {
    var n_k=subset[index_k];
    for(var index_i=0;index_i<subset.length;index_i++) {
      var n_i=subset[index_i];
      for(var index_j=0;index_j<subset.length;index_j++) {
        var n_j=subset[index_j];

        if (n_i != n_j) {

          d_ik = distances[index_k][index_i];
          d_jk = distances[index_k][index_j];
          d_ij = distances[index_i][index_j];

          if (d_ik != null && d_jk != null) {
            d_ik += d_jk;
            if (d_ij == null || (d_ij > d_ik) ) {
              distances2[index_i][index_j] = d_ik;
              distances2[index_j][index_i] = d_ik;
              next[index_i][index_j] = [];
              next[index_i][index_j] = next[index_i][index_j].concat(next[index_k][index_j]);
              continue;
            } else if(d_ij == d_ik) {
              next[index_i][index_j] = next[index_i][index_j].concat(next[index_k][index_j]);
            }
          }
          c++;
          distances2[index_j][index_i] = distances[index_j][index_i];
          distances2[index_i][index_j] = distances[index_i][index_j];
        }
      }
    }

    var t = distances2; 
    distances2 = distances;
    distances = t;

  }

  return {'ordering': subset, 'distances': distances, 'next': next};

}

// Returns dictionary of nodes' betweenness centrality
// Utilizes the Floyd-Warshall Algorithm with reconstruction
function hivtrace_compute_betweenness_centrality(node, obj, paths, newsubset) {


  if (!paths) {
    paths = hivtrace_compute_shortest_paths_with_reconstruction(obj);
  }

  // find index of id
  var index = paths['ordering'].indexOf(node);

  if (index == -1) {
    return null;
  }


  var length = paths['distances'].length;

  if(length != 2) {
    scale = 1 / ((length - 1) * (length - 2));
  } else {
    scale = 1;
  }
  

  // If s->t goes through 1, add to sum
  // Reconstruct each shortest path and check if node is in it
  var paths_with_node = [];
  for(i in _.range(length)) {
    for(j in _.range(length)) {
      paths_with_node.push(hivtrace_paths_with_node(index, paths['next'], i, j));
    }
  }
  
  return d3.sum(paths_with_node) * scale;

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
//datamonkey.hivtrace.compute_node_mean_paths = hivtrace_compute_node_mean_paths;
datamonkey.hivtrace.export_csv_button = hivtrace_export_csv_button;
datamonkey.hivtrace.convert_to_csv = hivtrace_convert_to_csv;
datamonkey.hivtrace.betweenness_centrality = hivtrace_compute_betweenness_centrality;
datamonkey.hivtrace.cluster_adjacency_list = hivtrace_cluster_adjacency_list;
