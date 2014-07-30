var _networkGraphAttrbuteID = "user attributes";


var clusterNetworkGraph = function (json, network_container, network_status_string, network_warning_tag, attributes) {

  var self = this;
  self.nodes = [];
  self.edges = [];
  self.clusters = [];         
  self.cluster_sizes = [];

  var w = 850,
      h = 800,
      popover = null,
      cluster_mapping = {},
      l_scale = 5000,   // link scale
      graph = json,     // the raw JSON network object
      max_points_to_render = 500,
      warning_string     = "",
      singletons         = 0,
      open_cluster_queue = [],
      currently_displayed_objects;

  /*------------ D3 globals and SVG elements ---------------*/
  var defaultFloatFormat = d3.format(",.2f");

  var network_layout = d3.layout.force()
    .on("tick", tick)
    .charge(function(d) { if (d.cluster_id) return -50-2*d.children.length; return -50*Math.sqrt(d.degree); })
    .linkDistance(function(d) { return Math.max(d.length*l_scale,1); })
    .linkStrength (function (d) { if (d.support != undefined) { return 2*(0.5-d.support);} return 1;})
    .friction (0.5)
    .size([w, h - 160]);
    
  d3.select(network_container).selectAll (".my_progress").remove();

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
                                      
   if (attributes && "hivtrace" in attributes && "attribute_map" in attributes["hivtrace"]) {
     /*  
        map attributes into nodes and into the graph object itself using 
        _networkGraphAttrbuteID as the key  
     */
     
     var attribute_map = attributes["hivtrace"]["attribute_map"];
     
     if ("map" in attribute_map && attribute_map["map"].length > 0) {
     
        graph [_networkGraphAttrbuteID] = attribute_map["map"].map (function (a) { return {'label': a, 'values': {}};});
        
        graph.Nodes.forEach (function (n) { n[_networkGraphAttrbuteID] = n.id.split (attribute_map["delimiter"]); });

    }
   }
   


  /*------------ Network layout code ---------------*/
  var handle_cluster_click = function (cluster) {
    var container = d3.select(network_container);
    var id = "d3_context_menu_id";
    var menu_object = container.select ("#" + id);
    
    if (menu_object.empty()) {
      menu_object = container.append ("ul")
        .attr ("id", id)
        .attr ("class","dropdown-menu")
        .attr ("role", "menu");
    } 

    menu_object.selectAll ("li").remove();

    if (cluster) {
      cluster.fixed = 1;
      menu_object.append("li").append ("a")
                   .attr("tabindex", "-1")
                   .text("Expand cluster")
                   .on ("click", function (d) {
                      cluster.fixed = 0;
                      expand_cluster_handler(cluster, true);
                      menu_object.style ("display", "none"); 
                      });

      menu_object.append("li").append ("a")
                   .attr ("tabindex", "-1")
                   .text ("Center on screen")
                   .on ("click", function (d) {
                      cluster.fixed = 0;
                      center_cluster_handler(cluster);
                      menu_object.style ("display", "none"); 
                      });
                     
      menu_object.style ("position", "absolute")
        .style ("left", "" + d3.event.offsetX + "px")
        .style ("top", "" + d3.event.offsetY + "px")
        .style ("display", "block");

    } else {
      menu_object.style ("display", "none");
    }

    container.on("click", function (d) {handle_cluster_click(null);}, true);

  };

  var handle_node_click = function (node) {
    var container = d3.select(network_container);
    var id = "d3_context_menu_id";
    var menu_object = container.select ("#" + id);
    
    if (menu_object.empty()) {
      menu_object = container.append ("ul")
        .attr ("id", id)
        .attr ("class","dropdown-menu")
        .attr ("role", "menu");
    } 

    menu_object.selectAll ("li").remove();

    if (node) {
      node.fixed = 1;
      menu_object.append("li").append ("a")
                   .attr("tabindex", "-1")
                   .text("Collapse cluster")
                   .on ("click", function (d) {
                      node.fixed = 0;
                      collapse_cluster_handler(node, true)
                      menu_object.style ("display", "none"); 
                      });

      menu_object.style ("position", "absolute")
        .style ("left", "" + d3.event.offsetX + "px")
        .style ("top", "" + d3.event.offsetY + "px")
        .style ("display", "block");

    } else {
      menu_object.style("display", "none");
    }

    container.on("click", function (d) {handle_node_click(null);}, true);

  };

  function get_initial_xy (nodes, cluster_count, exclude ) { 
      var d_clusters = {'id': 'root', 'children': []};
      for (var k = 0; k < cluster_count; k+=1) {
       if (exclude != undefined && exclude[k+1] != undefined) {continue;}
          d_clusters.children.push ({'cluster_id' : k+1, 'children': nodes.filter (function (v) {return v.cluster == k+1;})});
      }   
      
      var treemap = d3.layout.treemap()
      .size([w, h])
      .sticky(true)
      .children (function (d)  {return d.children;})
      .value(function(d) { return 1;});
      
      return treemap.nodes (d_clusters);
  }

  function prepare_data_to_graph () {

      var graphMe = {};
      graphMe.all = [];
      graphMe.edges = [];
      graphMe.nodes = [];
      graphMe.clusters = [];

      expandedClusters = [];
      drawnNodes = [];
      
      
      self.clusters.forEach (function (x) {
          if (x.collapsed) {
              graphMe.clusters.push (x);
              graphMe.all.push(x);
          } else {
              expandedClusters[x.cluster_id] = 1;
          }
      });
      
      self.nodes.forEach (function (x, i) {
          if (expandedClusters[x.cluster] != undefined) {
              drawnNodes [i] = graphMe.nodes.length +  graphMe.clusters.length;
              graphMe.nodes.push (x); 
              graphMe.all.push (x); 
          }
      
      });
      
      self.edges.forEach (function (x) {
          if (drawnNodes[x.source] != undefined && drawnNodes[x.target] != undefined) {
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

  function default_layout (clusters, nodes, exclude_cluster_ids) {
        init_layout = get_initial_xy (nodes, self.cluster_sizes.length, exclude_cluster_ids);
        clusters = init_layout.filter (function (v,i,obj) { return  !(typeof v.cluster_id === "undefined");});
        nodes = nodes.map (function (v) {v.x += v.dx/2; v.y += v.dy/2; return v;});
        clusters.forEach (collapse_cluster); 
        return [clusters, nodes];
    }


  /*------------ Constructor ---------------*/
  function initial_json_load() {
    var connected_links = [];
    var total = 0;
    var exclude_cluster_ids = {};
    self.cluster_sizes = [];

    graph.Nodes.forEach (function (d) { 
      if (typeof self.cluster_sizes[d.cluster-1]  === "undefined") {
        self.cluster_sizes[d.cluster-1] = 1;
      } else {
        self.cluster_sizes[d.cluster-1] ++;
      }
      if ("is_lanl" in d) {
        d.is_lanl = d.is_lanl == "true";
      }
      if ("hxb2_linked" in d) {
        d.hxb2_linked = d.hxb2_linked == "true";
      }
      
    });
     
    if (self.cluster_sizes.length > max_points_to_render) {
      var sorted_array = self.cluster_sizes.map (function (d,i) { 
          return [d,i+1]; 
        }).sort (function (a,b) {
          return a[0] - b[0];
        });

      for (var k = 0; k < sorted_array.length - max_points_to_render; k++) {
          exclude_cluster_ids[sorted_array[k][1]] = 1;
      }
      warning_string = "Excluded " + (sorted_array.length - max_points_to_render) + " clusters (maximum size " +  sorted_array[k-1][0] + " nodes) because only " + max_points_to_render + " points can be shown at once.";
    }
    
    // Initialize class attributes
    singletons = graph.Nodes.filter (function (v,i) { return v.cluster === null; }).length; self.nodes = graph.Nodes.filter (function (v,i) { if (v.cluster && typeof exclude_cluster_ids[v.cluster]  === "undefined"  ) {connected_links[i] = total++; return true;} return false;  });
    self.edges = graph.Edges.filter (function (v,i) { return connected_links[v.source] != undefined && connected_links[v.target] != undefined});
    self.edges = self.edges.map (function (v,i) {v.source = connected_links[v.source]; v.target = connected_links[v.target]; v.id = i; return v;});

    compute_node_degrees(self.nodes, self.edges);

    var r = default_layout(self.clusters, self.nodes, exclude_cluster_ids);
    self.clusters = r[0];
    self.nodes = r[1];
    self.clusters.forEach (function (d,i) {cluster_mapping[d.cluster_id] = i;});
     
    update();
 
  }  

  /*------------ Update layout code ---------------*/
  function update_network_string (draw_me) {
      var clusters_shown = self.clusters.length-draw_me.clusters.length,
          clusters_removed = graph["Cluster sizes"].length - self.clusters.length,
          nodes_removed = graph["Nodes"].length - singletons - self.nodes.length;
          
      var s = "Displaying a network on <strong>" + self.nodes.length + "</strong> nodes and <strong>" + self.clusters.length + "</strong> clusters "
              + (clusters_removed > 0 ? "(an additional " + clusters_removed + " clusters and " + nodes_removed + " nodes have been removed due to network size constraints)" : "") + " and <strong>" 
              + clusters_shown +"</strong> are expanded. Of <strong>" + self.edges.length + "</strong> edges, <strong>" + draw_me.edges.length + "</strong> are displayed. ";
      if (singletons > 0) {
          s += "<strong>" +singletons + "</strong> singleton nodes are not shown. ";
      }
      d3.select (network_status_string).html(s);
  }

  
  function draw_a_node (container, node) {
    container = d3.select(container);
    
    container.attr("d", d3.svg.symbol().size( function(d) { var r = 3+Math.sqrt(d.degree); return 4*r*r; })
        .type( function(d) { return d.hxb2_linked ? "cross" : (d.is_lanl ? "triangle-down" : "circle") }))
        .attr('class', 'node')
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y+ ")"; })
        .style('fill', function(d) { return node_color(d); })
        .on ('click', handle_node_click)
        .on ('mouseover', node_pop_on)
        .on ('mouseout', node_pop_off)
        .call(network_layout.drag().on('dragstart', node_pop_off));
  }

  function draw_a_link (container, link) {
     container = d3.select(container);
     container.attr ("class", "cluster")
          .attr ("width", function (d) {return cluster_box_size(d); })
          .attr ("height", function (d) {return cluster_box_size(d); })
          .attr ("rx", 1)
          .attr ("ry", 1)
          .attr("x", function(d) { return d.x; })
          .attr("y", function(d) { return d.y; })
          .style("fill", function(d) { return cluster_color (d); })
          .on ("click", handle_cluster_click)
          .on ("mouseover", cluster_pop_on)
          .on ("mouseout", cluster_pop_off)
          .call(network_layout.drag().on("dragstart", cluster_pop_off));
  }
  
  function update() {
  
    if (warning_string.length) {
      d3.select (network_warning_tag).text (warning_string).style ("display", "block");
    } else {
      d3.select (network_warning_tag).style ("display", "none");  
    }

    var draw_me = prepare_data_to_graph(); 
    
    network_layout.nodes(draw_me.all)
        .links(draw_me.edges)
        .start ();
        
    update_network_string(draw_me);
        
    var link = network_svg.selectAll(".link")
        .data(draw_me.edges, function (d) {return d.id;});
        
    var link_enter = link.enter().append("line")
        .attr("class", function (d) { if (d.removed) return "link removed"; return "link";  });
        
    var directed_links = link_enter.filter (function (d) {return d.directed;})
      .attr("marker-end", "url(#arrowhead)");

    link.exit().remove();

    // Differentiate between lanl and regular nodes

 
    
    
    var rendered_nodes = network_svg.selectAll('.node')
        .data(draw_me.nodes, function (d) {return d.id;});

    rendered_nodes.exit().remove();
    rendered_nodes.enter().append("path");
    rendered_nodes.each (function (d) { 
              draw_a_node (this, d);
             });

        
        
   
    var rendered_clusters = network_svg.selectAll (".cluster").
          data(draw_me.clusters, function (d) {return d.cluster_id;});
          
    rendered_clusters.exit().remove();
    rendered_clusters.enter().append ("rect");
    rendered_clusters.each (function (d) {
        draw_a_link (this, d);
    });
    
     

    currently_displayed_objects = rendered_clusters[0].length + rendered_nodes[0].length;

    network_layout.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      rendered_nodes.attr("transform", function(d) { return "translate(" + d.x + "," + d.y+ ")"; });
          
      rendered_clusters.attr("x", function(d) { return d.x; })
              .attr("y", function(d) { return d.y; });
    });    
  }

  function tick() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }

  /*------------ Node Methods ---------------*/
  function compute_node_degrees(nodes, edges) {
      for (var n in nodes) {
          nodes[n].degree = 0;
      }
      
      for (var e in edges) {
          nodes[edges[e].source].degree++;
          nodes[edges[e].target].degree++;
      }
  }

  function node_color(d) {
    return d.hxb2_linked ? "black" : (d.is_lanl ? "red" : "#fd8d3c");
  }

  function node_info_string (n) {
      return "Degree <em>" + n.degree + "</em>"+
             "<br>Clustering coefficient <em>" + 1.0 + "</em>";          
  }

  function node_pop_on (d) {
      toggle_tooltip (this, true, "Node " + d.id, node_info_string (d));
  }

  function node_pop_off (d) {
      toggle_tooltip (this, false);
  }


  /*------------ Cluster Methods ---------------*/

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

  function collapse_cluster(x, keep_in_q) {
      x.collapsed = true;
      if (!keep_in_q) {
          var idx = open_cluster_queue.indexOf(x.cluster_id);
          if (idx >= 0) {
           open_cluster_queue.splice (idx,1);
          }
      }
      compute_cluster_centroids ([x]);
      return x.children.length;
  }

  function expand_cluster (x, copy_coord) {
      x.collapsed = false;
      open_cluster_queue.push (x.cluster_id);
      if (copy_coord) {
          x.children.forEach (function (n) { n.x = x.x + (Math.random()-0.5)*x.children.length; n.y = x.y + (Math.random()-0.5)*x.children.length; });
      }
  }

  function cluster_color(d) {
    return "#3182bd";
  }

  function cluster_info_string (id) {
      var the_cluster = self.clusters[id-1],
          degrees = the_cluster.children.map (function (d) {return d.degree;});


      return "<strong>" + self.cluster_sizes[id-1] + "</strong> nodes." + 
             "<br>Mean degree <em>" + defaultFloatFormat(d3.mean (degrees)) + "</em>" +
             "<br>Max degree <em>" + d3.max (degrees) + "</em>";
  }

  function cluster_pop_on (d) {
      toggle_tooltip (this, true, "Cluster " + d.cluster_id, cluster_info_string (d.cluster_id));
  }

  function cluster_pop_off (d) {
      toggle_tooltip (this, false);
  }

  function expand_cluster_handler (d, do_update) {
    if (d.collapsed) {  
        var new_nodes = self.cluster_sizes[d.cluster_id-1];
        var leftover = new_nodes + currently_displayed_objects - max_points_to_render;
        if (leftover > 0) {
          for (k = 0; k < open_cluster_queue.length && leftover > 0; k++) {
              var cluster = self.clusters[cluster_mapping[open_cluster_queue[k]]];
              leftover -= cluster.children.length - 1;
              collapse_cluster(cluster,true);
          }
          if (k) {
              open_cluster_queue.splice (0, k);
          }
        }
    
        expand_cluster (d, true);
        if (do_update) {
            network_layout.friction (0.6);
            update();
        }
    }
  }

  function collapse_cluster_handler (d, do_update) {
    collapse_cluster(self.clusters[cluster_mapping[d.cluster]]);
    if (do_update) {
        network_layout.friction (0.4);
        update();
    }
    
  }

  function center_cluster_handler (d) {
    d.x = w/2;
    d.y = h/2;
    network_layout.friction (0.4);
    update();
  }

  function cluster_box_size (c) {
      return 5*Math.sqrt (c.children.length);
  }

  self.expand_all_clusters = function(e)  {
    self.clusters.forEach (function (x) { expand_cluster_handler (x, false); });
    update (); 
    e.preventDefault();// prevent the default anchor functionality
  }

  self.collapse_all_clusters = function(e) {
    self.clusters.forEach (function (x) { if (!x.collapsed) collapse_cluster (x); });
    update();
    e.preventDefault();// prevent the default anchor functionality
  }

  $('#reset_layout').click(function(e) {
    default_layout(clusters, nodes);
    update ();
    e.preventDefault();// prevent the default anchor functionality
    });

  /*------------ Event Functions ---------------*/
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
  initial_json_load();       
  return this;
}
