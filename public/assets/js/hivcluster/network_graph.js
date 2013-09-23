$(document).ready(function(){
  if(!inProgress()) {
    initializeClusterNetworkGraphs();
  }
});

function inProgress() {
  return $('.progress').length > 0;
}

var initializeClusterNetworkGraphs = function () {

  var network_container     = '#network_tag',
      network_status_string = '#network_status_string',
      histogram_tag         = '#histogram_tag',
      histogram_label       = '#histogram_label';

  var cluster_results = clusterNetworkGraph(network_container, 
                        network_status_string,
                        histogram_tag, 
                        histogram_label);

  if($('#lanl-cluster-results').length > 0) {

    // Only if the comparison was done
    var lanl_network_container     = '#lanl_network_tag',
        lanl_network_status_string = '#lanl_network_status_string',
        lanl_histogram_tag         = '#lanl_histogram_tag',
        lanl_histogram_label       = '#lanl_histogram_label';

    var lanl_cluster_results = clusterNetworkGraph(lanl_network_container, 
                             lanl_network_status_string,
                             lanl_histogram_tag, 
                             lanl_histogram_label);
  }

}

var clusterNetworkGraph = function (network_container, network_status_string, 
                                histogram_tag, histogram_label) {

  var w = 850,
      h = 800,
      histogram_w = 300,
      histogram_h = 300,
      popover = null,
      cluster_sizes,
      cluster_mapping = {},
      l_scale = 5000, // link scale
      graph,    // the raw JSON network object
      nodes,    // node objects filtered down to contain only the connected ones
      edges,    // edges between nodes
      clusters, // cluster 'nodes', used either as fixed cluster anchors, or 
                // to be a placeholder for the cluster
      max_points_to_render = 256,
      popover_html = "<div class='btn-group btn-group-vertical'>\
      <button class='btn btn-link btn-mini' type='button' id = 'cluster_expand_button'>Expand cluster</button>\
      <button class='btn btn-link btn-mini' id = 'cluster_center_button' type='button'>Center on screen</button>\
      </div>",
       popover_html2 = "<div class='btn-group btn-group-vertical'>\
      <button class='btn btn-link btn-mini' type='button' id = 'cluster_collapse_button'>Collapse cluster</button>\
      <button class='btn btn-link btn-mini' id = 'cluster_center_button' type='button'>Center on screen</button>\
      </div>",
      warning_string     = "",
      singletons         = 0,
      open_cluster_queue = [],
      currently_displayed_objects;

  //Get JSON url
  var json_url = $(network_container).data('url');

  /*------------ "MAIN CALL" ---------------*/
  //$('#indicator').show();
  d3.json(json_url, initial_json_load);

      
  /*------------ D3 globals and SVG elements ---------------*/
      
  var defaultFloatFormat = d3.format(",.2f");

      
  var network_layout = d3.layout.force()
      .on("tick", tick)
      .charge(function(d) { if (d.cluster_id) return -50-2*d.children.length; return -50*Math.sqrt(d.degree); })
      .linkDistance(function(d) { return Math.max(d.length*l_scale,1); })
      .friction (0.5)
      .size([w, h - 160]);

  var network_svg = d3.select(network_container).append("svg:svg")
      .attr("width", w)
      .attr("height", h)
      .style ("border", "solid black 1px");


      
  network_svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("refX", 9) /*must be smarter way to calculate shift*/
      .attr("refY", 2)
      .attr("markerWidth",  6)
      .attr("markerHeight", 4)
      .attr("orient", "auto")
      .attr("stroke", "#666666")
      .attr("fill", "#AAAAAA")
      .append("path")
          .attr("d", "M 0,0 V 4 L6,2 Z"); //this is actual shape for arrowhead
          
          
  /*------------ Network layout code ---------------*/
          
      
  function  get_initial_xy (nodes, cluster_count, exclude ) {  
      var d_clusters = {'id': 'root', 'children': []};
      for (var k = 0; k < cluster_count; k+=1) {
          if (exclude[k+1] != undefined) {continue;}
          d_clusters.children.push ({'cluster_id' : k+1, 'children': nodes.filter (function (v) {return v.cluster == k+1;})});
      }   
      
      var treemap = d3.layout.treemap()
      .size([w, h])
      .sticky(true)
      .children (function (d)  {return d.children;})
      .value(function(d) { return 1;});
      
      return treemap.nodes (d_clusters);
  }

  function compute_cluster_centroids (clusters) {
      for (var c in clusters) {
          var cls = clusters[c];
          cls.x = 0.;
          cls.y = 0.;
          cls.children.forEach (function (x) { cls.x += x.x; cls.y += x.y; });
          cls.x /= cls.children.length;
          cls.y /= cls.children.length;
      }
  }

  function collapseCluster (x, keep_in_q) {
      x.collapsed = true;
      if (!keep_in_q) {
          var idx = open_cluster_queue.indexOf (x.cluster_id);
          if (idx >= 0) {
           open_cluster_queue.splice (idx,1);
          }
      }
      compute_cluster_centroids ([x]);
      return x.children.length;
  }

  function expandCluster (x, copy_coord) {
      x.collapsed = false;
      open_cluster_queue.push (x.cluster_id);
      if (copy_coord) {
          x.children.forEach (function (n) { n.x = x.x + (Math.random()-0.5)*x.children.length; n.y = x.y + (Math.random()-0.5)*x.children.length; });
      }
  }

  function computeNodeDegrees (nodes, egdes) {
      for (var n in nodes) {
          nodes[n].degree = 0;
      }
      
      for (var e in edges) {
          nodes[edges[e].source].degree ++;
          nodes[edges[e].target].degree ++;
      }
  }

  function prepareDataToGraph () {
      var graphMe = {};
      graphMe.all = [];
      graphMe.edges = [];
      graphMe.nodes = [];
      graphMe.clusters = [];
      
      expandedClusters = [];
      drawnNodes       = [];
      
      clusters.forEach (function (x) {
          if (x.collapsed) {
              graphMe.clusters.push (x);
              graphMe.all.push(x);
          } else {
              expandedClusters [x.cluster_id] = 1;
          }
      });
      
      nodes.forEach (function (x, i) {
          if (expandedClusters[x.cluster] != undefined) {
              //console.log ('Draw node ' + i);
              drawnNodes [i] = graphMe.nodes.length +  graphMe.clusters.length;
              graphMe.nodes.push (x); 
              graphMe.all.push (x); 
          }
      
      });
      
      edges.forEach (function (x) {
          if (drawnNodes[x.source] != undefined && drawnNodes [x.target] != undefined) {
              var y = {};
              for (var prop in x) {
                  y[prop] = x[prop];
              }
              y.source = drawnNodes[x.source];
              y.target = drawnNodes[x.target];
              graphMe.edges.push(y);
          }
      });
      return graphMe;
  }


  function initial_json_load (json) {
    graph = json;
    connected_links = [];
    total = 0;
    exclude_cluster_ids = {};
    
    cluster_sizes = [];
    graph.Nodes.forEach (function (d) { if (typeof cluster_sizes[d.cluster-1]  === "undefined") {cluster_sizes[d.cluster-1] = 1;} else {cluster_sizes[d.cluster-1] ++;}});
     
    if (cluster_sizes.length > max_points_to_render) {
      var sorted_array = cluster_sizes.map (function (d,i) { return [d,i+1]; }).sort (function (a,b) {return a[0] - b[0];});
      for (var k = 0; k < sorted_array.length - max_points_to_render; k++) {
          exclude_cluster_ids[sorted_array[k][1]] = 1;
      }
      warning_string = "Excluded " + (sorted_array.length - max_points_to_render) + " clusters (maximum size " +  sorted_array[k-1][0] + " nodes) because only " + max_points_to_render + " points can be shown at once.";
    } 
    
    singletons = graph.Nodes.filter (function (v,i) { return v.cluster === null; }).length;
    nodes = graph.Nodes.filter (function (v,i) { if (v.cluster && typeof exclude_cluster_ids[v.cluster]  === "undefined"  ) {connected_links[i] = total++; return true;} return false;  });
    edges = graph.Edges.filter (function (v,i) { return connected_links[v.source] != undefined && connected_links[v.target] != undefined});
    edges = edges.map (function (v,i) {v.source = connected_links[v.source]; v.target = connected_links[v.target]; v.id = i; return v;});
    computeNodeDegrees  (nodes, edges);
    
    init_layout = get_initial_xy (nodes, cluster_sizes.length, exclude_cluster_ids);
    clusters = init_layout.filter (function (v,i,obj) { return  !(typeof v.cluster_id === "undefined");});
    nodes = nodes.map (function (v) {v.x += v.dx/2; v.y += v.dy/2; return v;});
    clusters.forEach (collapseCluster); 
    clusters.forEach (function (d,i) {cluster_mapping[d.cluster_id] = i;});
    


    if(graph["Degrees"]["fitted"] != null) {
      render_histogram (graph["Degrees"]["Distribution"], graph["Degrees"]["fitted"], histogram_w, histogram_h, "histogram_tag");
      d3.select (histogram_label).html ("Network degree distribution is best described by the <strong>" + json ["Degrees"]["Model"] + "</strong> model, with &rho; of " + defaultFloatFormat(json ["Degrees"]["rho"])
                + " (95% CI " + defaultFloatFormat(json ["Degrees"]["rho CI"][0]) + " - " + defaultFloatFormat(json ["Degrees"]["rho CI"][1]) + ")" );
    }
    
    update();
    //$('#indicator').hide();
    $('#results').show();

  }

  function render_histogram (counts, fit, w, h, id) {
      var margin = {top: 10, right: 30, bottom: 30, left: 30},
                  width = w - margin.left - margin.right,
                  height = h - margin.top - margin.bottom;
      
      var x = d3.scale.linear()
              .domain([0, counts.length+1])
              .range([0, width]);
              
      var y = d3.scale.linear()
              .domain ([0, d3.max (counts)])
              .range  ([height,0]);
              
      var total = d3.sum (counts);          

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");
          
      var fit_line = d3.svg.line()
          .interpolate("linear")
          .x(function(d,i) { return x(i+1) + (x(i+1)-x(i))/2; })
          .y(function(d) { return y(d*total); });


      var histogram_svg = d3.select("#" + id).selectAll ("svg");

      if (histogram_svg != undefined) {
          histogram_svg.remove();
      }
      
      histogram_svg = d3.select(histogram_tag).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
      
          var bar = histogram_svg.selectAll(".bar")
          .data(counts)
          .enter().append("g")
          .attr("class", "bar")
          .attr("transform", function(d,i) { return "translate(" + x(i+1) + "," + y(d) + ")"; });
          
      bar.append("rect")
          .attr("x", 1)
          .attr("width", function (d,i) {return x(i+2) - x(i+1) - 1;})
          .attr("height", function(d) { return height - y(d); })
          .append ("title").text (function (d,i) { return "" + counts[i] + " nodes with degree " + (i+1);});

       histogram_svg.append("path").datum(fit)
        .attr("class", "line")
        .attr("d", function(d) { return fit_line(d); });

      /*bar.append("text")
          .attr("dy", ".75em")
          .attr("y", 6)
          .attr("x", x(data[0].dx) / 2)
          .attr("text-anchor", "middle")
          .text(function(d) { return formatCount(d.y); });
      */
      
      histogram_svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);    
  }


  function updateNetworkString (draw_me) {
      var clusters_shown = clusters.length-draw_me.clusters.length,
          clusters_removed = graph["Cluster sizes"].length - clusters.length,
          nodes_removed = graph["Nodes"].length - singletons - nodes.length;
          
      var s = "Displaying a network on <strong>" + nodes.length + "</strong> nodes and <strong>" + clusters.length + "</strong> clusters "
              + (clusters_removed > 0 ? "(an additional " + clusters_removed + " clusters and " + nodes_removed + " nodes have been removed due to network size constraints)" : "") + " and <strong>" 
              + clusters_shown +"</strong> are expanded. Of <strong>" + edges.length + "</strong> edges, <strong>" + draw_me.edges.length + "</strong> are displayed. ";
      if (singletons > 0) {
          s += "<strong>" +singletons + "</strong> singleton nodes are not shown. ";
      }
      d3.select (network_status_string).html (s);
  }

  function update () {

    if (warning_string.length) {
      d3.select ("#main-warning").text (warning_string).style ("display", "block");
    } else {
      d3.select ("#main-warning").style ("display", "none");  
    }

    var draw_me = prepareDataToGraph(); 
    
    network_layout.nodes(draw_me.all)
        .links (draw_me.edges)
        .start ();
        
    updateNetworkString (draw_me);  
        
    var link = network_svg.selectAll(".link")
        .data(draw_me.edges, function (d) {return d.id;});
        
    link.exit().remove();
    
    var link_enter = link.enter().append("line")
        .attr("class", "link");
        
    var directed_links = link_enter.filter (function (d) {return d.directed;})
      .attr("marker-end", "url(#arrowhead)");

    var rendered_nodes = network_svg.selectAll(".node")
        .data(draw_me.nodes, function (d) {return d.id;});
        
        
    rendered_nodes.enter().append("circle")
        .attr("class", "node")
        .attr("r", function (d) { return  3+Math.sqrt(d.degree);} )
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; })
        .style("fill", function(d) { return nodeColor (d); })
        .on ("click", click_node)
        .on ("mouseover", node_pop_on)
        .on ("mouseout", node_pop_off)
        .call(network_layout.drag().on("dragstart", node_pop_off));
        
    rendered_nodes.exit().remove();
    
    var rendered_clusters = network_svg.selectAll (".cluster").
          data(draw_me.clusters, function (d) {return d.cluster_id;});
          
    rendered_clusters.exit().remove();
    
    rendered_clusters.enter().append ("rect")
      .attr ("class", "cluster")
      .attr ("width", function (d) {return cluster_box_size(d); })
      .attr ("height", function (d) {return cluster_box_size(d); })
      .attr ("rx", 1)
      .attr ("ry", 1)
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; })
      .style("fill", function(d) { return clusterColor (d); })
      .on ("click", click_cluster)
      .on ("mouseover", cluster_pop_on)
      .on ("mouseout", cluster_pop_off)
      .call(network_layout.drag().on("dragstart", cluster_pop_off));
      //.append ("title").text (function (d) {return "Cluster " + d.cluster_id + " with " + cluster_sizes[d.cluster_id-1] + " nodes.";});

    currently_displayed_objects = rendered_clusters[0].length + rendered_nodes[0].length;

    network_layout.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      rendered_nodes.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
          
      rendered_clusters.attr("x", function(d) { return d.x; })
              .attr("y", function(d) { return d.y; });
          
      //
    });    
  }



  function cluster_box_size (c) {
      return 5*Math.sqrt (c.children.length);
  }

  function tick() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }


  function nodeColor(d) {
    //console.log (d);
    return "#fd8d3c";
  }

  function clusterColor(d) {
    //console.log (d);
    return "#3182bd";
  }

  function clusterInfoString (id) {
      var the_cluster = clusters[id-1],
          degrees = the_cluster.children.map (function (d) {return d.degree;});
          
      return "<strong>" + cluster_sizes[id-1] + "</strong> nodes." + 
             "<br>Mean degree <em>" + defaultFloatFormat(d3.mean (degrees)) + "</em>"+
             "<br>Max degree <em>" + d3.max (degrees) + "</em>";
             
  }


  function nodeInfoString (n) {
      return "Degree <em>" + n.degree + "</em>"+
             "<br>Clustering coefficient <em>" + 1.0 + "</em>";          
  }

  function toggle_tooltip(element, turn_on, title, tag) {
    if (d3.event.defaultPrevented) return;
    if (turn_on && element.tooltip == undefined) {
        var this_box = $(element);
        var this_data = d3.select(element).datum();
        element.tooltip = this_box.tooltip({
                   'title': title + "<br>" + tag,
                   'html': true,
                   'container': 'body'
                 });
                 
        //this_data.fixed = true;
        element.tooltip.tooltip ('show');
    } else {
          if (turn_on == false && element.tooltip != undefined) {
              element.tooltip.tooltip('destroy');
              element.tooltip = undefined;
              //d3.select(element).datum().fixed = false;
          }
    }
  }

  function bindClusterButtonEvents (d, element) {
      $('#cluster_expand_button').on('click', function (e) {
          expandClusterHandler (d, true);
          toggle_popover (element, false);
      });
      $('#cluster_collapse_button').on('click', function (e) {
          collapseClusterHandler (d, true);
          toggle_popover (element, false);
      });
      $('#cluster_center_button').on('click', function (e) {
          centerClusterHandler (d);
          toggle_popover (element, false);
      });
  }

  function toggle_popover (element, turn_on, d, title, tag) {
    if (d3.event && d3.event.defaultPrevented) return;
    if (turn_on && popover == undefined) {
        var this_box = $(element);
        var this_data = d3.select(element).datum();
        popover = this_box.popover({
                   'title': title,
                   'content': tag,
                   'html': true,
                   'container': 'body'
                 });
                 
        popover.popover ('show');
        bindClusterButtonEvents (d, element);
     } else {
          if (turn_on == false && popover != undefined) {
              popover.popover('destroy');
              popover = undefined;
          }
    }
  }


  function cluster_pop_on (d) {
      toggle_tooltip (this, true, "Cluster " + d.cluster_id, clusterInfoString (d.cluster_id));
  }

  function cluster_pop_off (d) {
      toggle_tooltip (this, false);
  }

  function node_pop_on (d) {
      toggle_tooltip (this, true, "Node " + d.id, nodeInfoString (d));
  }

  function node_pop_off (d) {
      toggle_tooltip (this, false);
  }

  function expandClusterHandler (d, do_update) { 
    var new_nodes = cluster_sizes[d.cluster_id-1];
    var leftover = new_nodes + currently_displayed_objects - max_points_to_render;
    if (leftover > 0) {
      for (k = 0; k < open_cluster_queue.length && leftover > 0; k++) {
          var cluster = clusters[cluster_mapping[open_cluster_queue[k]]];
          leftover -= cluster.children.length - 1;
          collapseCluster (cluster,true);
      }
      if (k) {
          open_cluster_queue.splice (0, k);
      }
    }
    
    expandCluster (d, true);
    if (do_update) {
        network_layout.friction (0.6);
        update();
    }
  }

  function collapseClusterHandler (d, do_update) {
    collapseCluster (clusters[cluster_mapping[d.cluster]]);
    if (do_update) {
        network_layout.friction (0.4);
        update();
    }
  }

  function centerClusterHandler (d) {
    d.x = w/2;
    d.y = h/2;
    network_layout.friction (0.4);
    update();
  }

  function click_cluster(d) {
    if (d3.event.defaultPrevented) return;
    toggle_popover (this, false);
    toggle_popover (this, true, d, null, popover_html);
  }

  // Toggle children on click.
  function click_node(d) {
    if (d3.event.defaultPrevented) return;
    toggle_popover (this, false);
    toggle_popover (this, true, d, null, popover_html2);
  }

}
