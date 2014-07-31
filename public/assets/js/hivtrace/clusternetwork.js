var _networkGraphAttrbuteID   = "user attributes";



var clusterNetworkGraph = function (json, network_container, network_status_string, network_warning_tag, button_bar_ui, attributes) {

  var self = this;
    self.nodes = [];
    self.edges = [];
    self.clusters = [];         
    self.cluster_sizes = [];
    self.colorizer = {};
    self.hide_hxb2 = false;

  var w = 875,
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
    .charge(function(d) { if (d.cluster_id) return -50-20*Math.pow(d.children.length,0.7); return -20*Math.sqrt(d.degree); })
    .linkDistance(function(d) { return Math.max(d.length*l_scale,1); })
    .linkStrength (function (d) { if (d.support != undefined) { return 2*(0.5-d.support);} return 1;})
    .chargeDistance (500)
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
                                      
   
   


  /*------------ Network layout code ---------------*/
  var handle_cluster_click = function (cluster, release) {

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

    var already_fixed = cluster && cluster.fixed == 1;
    

    if (cluster) {
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
                      
     menu_object.append("li").append ("a")
               .attr ("tabindex", "-1")
               .text (function (d) {if (cluster.fixed) return "Release fix"; return "Fix in place";})
               .on ("click", function (d) {
                  cluster.fixed = !cluster.fixed;
                  menu_object.style ("display", "none"); 
                  });

     cluster.fixed = 1;

     menu_object.style ("position", "absolute")
        .style("left", "" + d3.event.offsetX + "px")
        .style("top", "" + d3.event.offsetY + "px")
        .style("display", "block");

    } else {
      if (release) {
        release.fixed = 0;
      }
      menu_object.style("display", "none");
    }

    container.on("click", function (d) {handle_cluster_click(null, already_fixed ? null : cluster);}, true);

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
          // Check if hxb2_linked is in a child
          var hxb2_exists = x.children.some(function(c) {return c.hxb2_linked}) && self.hide_hxb2;
          if(!hxb2_exists) {
            if (x.collapsed) {
                graphMe.clusters.push (x);
                graphMe.all.push(x);
            } else {
                expandedClusters[x.cluster_id] = 1;
            }
          }
      });
      
      self.nodes.forEach (function (x, i) {
          if (expandedClusters[x.cluster] != undefined) {
              drawnNodes[i] = graphMe.nodes.length +  graphMe.clusters.length;
              graphMe.nodes.push(x); 
              graphMe.all.push(x); 
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
    var has_hxb2_links = false;
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
            has_hxb2_links = has_hxb2_links || d.hxb2_linked;
          }
      
    });

     /* add buttons and handlers */
     /* clusters first */
     
     if (button_bar_ui) {
     
         var cluster_container = d3.select ("#" + button_bar_ui + "_cluster_operations_container")
         cluster_container.append ("li").append ("a")
                                        .text ("Expand All")
                                        .attr ("href", "#")
                                        .attr ("id", button_bar_ui + "_cluster_expand_all_clusters")
                                        .on ("click", function(e) {
                                            self.expand_all_clusters();
                                            d3.event.preventDefault();
                                          });
         
          cluster_container.append ("li").append ("a")
                                        .text ("Collapse All")
                                        .attr ("href", "#")
                                        .attr ("id", button_bar_ui + "_cluster_collapse_all_clusters")
                                        .on ("click", function(e) {
                                            self.collapse_all_clusters();
                                            d3.event.preventDefault();
                                          });
        
         if (has_hxb2_links) {
            cluster_container.append ("li").append ("a")
                                        .text ("Hide clusters linking to HXB2")
                                        .attr ("href", "#")
                                        .attr ("id", button_bar_ui + "_cluster_hide_hxb2")
                                        .on ("click", function(e) {
                                            d3.select (this).text (self.hide_hxb2 ? "Hide clusters linking to HXB2" :  "Show clusters linking to HXB2");
                                            self.toggle_hxb2 ();
                                            d3.event.preventDefault();
                                          });
       
         }

    }
          
     
     
    
     if (attributes && "hivtrace" in attributes) {
        attributes = attributes["hivtrace"];
     }
     
     if (attributes && "attribute_map" in attributes) {
         /*  
            map attributes into nodes and into the graph object itself using 
            _networkGraphAttrbuteID as the key  
         */
     
         var attribute_map = attributes["attribute_map"];
     
         if ("map" in attribute_map && attribute_map["map"].length > 0) {
             graph [_networkGraphAttrbuteID] = attribute_map["map"].map (function (a,i) { return {'label': a, 'type' : null, 'values': {}, 'index' : i, 'range' : 0};});   
             
             graph.Nodes.forEach (function (n) { 
                n[_networkGraphAttrbuteID] = n.id.split (attribute_map["delimiter"]);
                n[_networkGraphAttrbuteID].forEach (function (v,i) {
                    if (i < graph [_networkGraphAttrbuteID].length) {
                        if (! (v in graph [_networkGraphAttrbuteID][i]["values"])) {
                            graph [_networkGraphAttrbuteID][i]["values"][v] = graph [_networkGraphAttrbuteID][i]["range"];
                            graph [_networkGraphAttrbuteID][i]["range"] += 1;
                        }
                    }
                    //graph [_networkGraphAttrbuteID][i]["values"][v] = 1 + (graph [_networkGraphAttrbuteID][i]["values"][v] ? graph [_networkGraphAttrbuteID][i]["values"][v] : 0);
                });
            });
           
            graph [_networkGraphAttrbuteID].forEach (function (d) {
                if (d['range'] < graph.Nodes.length && d['range'] > 1 &&d['range' ] <= 20) {
                    d['type'] = 'category';
                }
            });
            
            
            // populate the UI elements
            if (button_bar_ui) {
                var valid_cats = graph [_networkGraphAttrbuteID].filter (function (d) { return d['type'] == 'category'; });
                valid_cats.splice (0,0, {'label' : 'None', 'index' : -1});
               
                d3.select ("#" + button_bar_ui + "_attributes").selectAll ("li").remove();
                var cat_menu = d3.select ("#" + button_bar_ui + "_attributes").selectAll ("li")
                                .data(valid_cats.map (function (d) {return [[d['label'],d['index']]];}));                                             
                cat_menu.enter ().append ("li");
                cat_menu.selectAll ("a").data (function (d) {return d;})
                                        .enter ()
                                        .append ("a")
                                        .text (function (d,i,j) {return d[0];})
                                        .attr ("style", function (d,i,j) {if (j == 0) { return ' font-weight: bold;'}; return null; })
                                        .attr ('href', '#')
                                        .on ("click", function (d) { handle_attribute_categorical (d[1]); });
            }
        }
    }
    
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
          clusters_removed = self.cluster_sizes.length - self.clusters.length,
          nodes_removed = graph.Nodes.length - singletons - self.nodes.length;
          
      var s = "Displaying a network on <strong>" + self.nodes.length + "</strong> nodes, <strong>" + self.clusters.length + "</strong> clusters "
              + (clusters_removed > 0 ? "(an additional " + clusters_removed + " clusters and " + nodes_removed + " nodes have been removed due to network size constraints)" : "") + " and <strong>" 
              + clusters_shown +"</strong> clusters are expanded. Of <strong>" + self.edges.length + "</strong> edges, <strong>" + draw_me.edges.length + "</strong>, and of  <strong>" + self.nodes.length  + " </strong> nodes,  <strong>" + draw_me.nodes.length + " </strong> are displayed. ";
      if (singletons > 0) {
          s += "<strong>" +singletons + "</strong> singleton nodes are not shown. ";
      }
      d3.select (network_status_string).html(s);
  }

  
  function draw_a_node (container, node) {
    container = d3.select(container);
    container.attr("d", d3.svg.symbol().size( function(d) { var r = 3+Math.sqrt(d.degree); return 4*r*r; })
        .type( function(d) { return (d.hxb2_linked && !d.is_lanl) ? "cross" : (d.is_lanl ? "triangle-down" : "circle") }))
        .attr('class', 'node')
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y+ ")"; })
        .style('fill', function(d) { return node_color(d); })
        .on ('click', handle_node_click)
        .on ('mouseover', node_pop_on)
        .on ('mouseout', node_pop_off)
        .call(network_layout.drag().on('dragstart', node_pop_off));
  }
    

  function draw_a_cluster (container, the_cluster) {
     
     container_group = d3.select(container);
     
     var draw_from   = the_cluster["binned_attributes"] || [[null, 1]];
     
     var sum = draw_from.reduce (function (p, c) {return p+c[1];}, 0),
         running_total = 0;
         
     draw_from = draw_from.map (function (d) { var v = {'container' : container, 'cluster': the_cluster, 'startAngle' : running_total/sum*2*Math.PI, 'endAngle': (running_total+d[1])/sum*2*Math.PI, 'name': d[0]}; running_total += d[1]; return v;});
     
     var arc_radius = cluster_box_size(the_cluster)*0.5;
     var paths = container_group.selectAll ("path").data (draw_from);
     paths.enter ().append ("path");
     paths.exit ().remove();
     paths.attr ("class", "cluster")
          .attr ("d", d3.svg.arc().innerRadius(0).outerRadius(arc_radius))
          .style ("fill", function (d,i) {return cluster_color (the_cluster, d.name);});
    

  }
  
  function handle_attribute_categorical (cat_id) {
    var set_attr = "None";
  
    d3.select ("#" + button_bar_ui + "_attributes").selectAll ("li")
                                                   .selectAll ("a")
                                                   .attr ("style", function (d,i,j) {if (j == cat_id) { set_attr = d[0]; return ' font-weight: bold;'}; return null; });
      
    d3.select ("#" + button_bar_ui + "_attribute_label").html (set_attr + ' <span class="caret"></span>');
                                                   
    self.clusters.forEach (function (the_cluster) { the_cluster['binned_attributes'] = stratify(attribute_cluster_distribution (the_cluster, cat_id));});

    if (cat_id >= 0) {
        self.colorizer['category']    = graph [_networkGraphAttrbuteID][cat_id]['range'] <= 10 ? d3.scale.category10() : d3.scale.category20c();
        self.colorizer['category_id'] = cat_id;  
        self.colorizer['category_map'] = graph [_networkGraphAttrbuteID][cat_id]['values'];
        self.colorizer['category_map'][null] =  graph [_networkGraphAttrbuteID][cat_id]['range'];
        self.colorizer['category_pairwise'] = attribute_pairwise_distribution(cat_id, graph [_networkGraphAttrbuteID][cat_id]['range'] + 1, self.colorizer['category_map']);
        render_chord_diagram ("#" + button_bar_ui + "_aux_svg_holder", self.colorizer['category_map'], self.colorizer['category_pairwise']);
    } else {
        self.colorizer['category']          = null;
        self.colorizer['category_id']       = null;
        self.colorizer['category_pairwise'] = null;
        self.colorizer['category_map']      = null;
        render_chord_diagram ("#" + button_bar_ui + "_aux_svg_holder", null, null);
    }
    
    
    
    
    update(true);
    d3.event.preventDefault();
  }
  
  function update(soft, friction) {
  
    if (friction) {
        network_layout.friction (friction);
    }
    if (warning_string.length) {
      d3.select (network_warning_tag).text (warning_string).style ("display", "block");
      warning_string = "";
    } else {
      d3.select (network_warning_tag).style ("display", "none");  
    }

    var rendered_nodes, 
        rendered_clusters,
        link;
        
    if (!soft) {
        var draw_me = prepare_data_to_graph(); 
    
        network_layout.nodes(draw_me.all)
            .links(draw_me.edges)
            .start ();
        
        update_network_string(draw_me);
        
        link = network_svg.selectAll(".link")
            .data(draw_me.edges, function (d) {return d.id;});
        
        var link_enter = link.enter().append("line")
            .attr("class", function (d) { if (d.removed) return "link removed"; return "link";  })
            .filter (function (d) {return d.directed;})
            .attr("marker-end", "url(#arrowhead)");

        link.exit().remove();


    
        rendered_nodes  = network_svg.selectAll('.node')
            .data(draw_me.nodes, function (d) {return d.id;});
        rendered_nodes.exit().remove();
        rendered_nodes.enter().append("path");
        
        rendered_clusters = network_svg.selectAll (".cluster-group").
          data(draw_me.clusters.map (function (d) {return d;}), function (d) {return d.cluster_id;});
 
        rendered_clusters.exit().remove();
        rendered_clusters.enter().append ("g").attr ("class", "cluster-group")
              .attr ("transform", function(d) { return "translate(" + d.x + "," + d.y+ ")"; })
              .on ("click", handle_cluster_click)
              .on ("mouseover", cluster_pop_on)
              .on ("mouseout", cluster_pop_off)
              .call(network_layout.drag().on("dragstart", cluster_pop_off));
    
    } else {
        rendered_nodes = network_svg.selectAll('.node');
        rendered_clusters = network_svg.selectAll (".cluster-group");
        link = network_svg.selectAll(".link");
    }

    rendered_nodes.each (function (d) { 
              draw_a_node (this, d);
             });  
          
    rendered_clusters.each (function (d) {
        draw_a_cluster (this, d);
    });
    
     
    if (!soft) {
        currently_displayed_objects = rendered_clusters[0].length + rendered_nodes[0].length;

        network_layout.on("tick", function() {
        
          link.attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });

          rendered_nodes.attr("transform", function(d) { return "translate(" + d.x + "," + d.y+ ")"; });
          rendered_clusters.attr("transform", function(d) { return "translate(" + d.x + "," + d.y+ ")"; });
        });    
    }
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

    
  function  attribute_node_value_by_id (d, id) {
     if (_networkGraphAttrbuteID in d ) {
        if (id) {
            return d[_networkGraphAttrbuteID][id];
        }
     }
     return null;
  }
  
  function  attribute_name_by_id (id) {
    if (typeof id == "number") {
        return graph [_networkGraphAttrbuteID][id]['label'];
    }
    return null;
  }

  function node_color(d) {
    var color = attribute_node_value_by_id (d, self.colorizer['category_id']);
    if (color) {
        return self.colorizer['category'](color);
    }
    return d.hxb2_linked ? "black" : (d.is_lanl ? "red" : "#7fc97f");
  }

  function cluster_color(d, type) {
    if (d["binned_attributes"]) {
        return self.colorizer['category'](type);
    }
    return "#beaed4";
  }

  function hxb2_node_color(d) {
    return "black";
  }

  function node_info_string (n) {
      var str = "Degree <em>" + n.degree + "</em>"+
             "<br>Clustering coefficient <em>" + 1.0 + "</em>";
                 
      var attribute = attribute_node_value_by_id (n, self.colorizer['category_id']);
      if (attribute) {
         str += "<br>"  + attribute_name_by_id (self.colorizer['category_id']) + " <em>" + attribute + "</em>"
      }
      return str;
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
      currently_displayed_objects -= self.cluster_sizes[x.cluster_id-1]-1;
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
      currently_displayed_objects += self.cluster_sizes[x.cluster_id-1]-1;
      open_cluster_queue.push (x.cluster_id);
      if (copy_coord) {
          x.children.forEach (function (n) { n.x = x.x + (Math.random()-0.5)*x.children.length; n.y = x.y + (Math.random()-0.5)*x.children.length; });
      }
  }

  function render_chord_diagram (id, the_map, matrix) {
         
        d3.select (id).selectAll ("svg").remove();
        if (matrix) {
        
            var lookup = matrix[0].map (function (d) {return 0;});
            for (k in the_map) {
                lookup[the_map[k]] = k;
            }   
  
            var svg = d3.select (id).append ("svg");
        
        
            var chord = d3.layout.chord()
                .padding(.05)
                .sortSubgroups(d3.descending)
                .matrix(matrix);

            var text_offset = 20,
                width  = 300,
                height = 300,
                innerRadius = Math.min(width, height-text_offset) * .41,
                outerRadius = innerRadius * 1.1;

            var fill = self.colorizer['category'],
                font_size = 12;
        
        
        
            var text_label = svg.append ("g")
                                .attr("transform", "translate(" + width / 2 + "," + (height-text_offset)  + ")")
                                .append ("text")
                                .attr ("text-anchor", "middle")
                                .attr ("font-size", font_size)
                                .text ("");

            svg = svg.attr("width", width)
                .attr("height", height-text_offset)
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + (height-text_offset) / 2 + ")");
            
            //console.log (chord.groups());
    
            svg.append("g").selectAll("path")
                .data(chord.groups)
              .enter().append("path")
                .style("fill", function(d)   { return fill(lookup[d.index]); })
                .style("stroke", function(d) { return fill(lookup[d.index]); })
                .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
                .on("mouseover", fade(0.1,true))
                .on("mouseout", fade(1,false));

        

            svg.append("g")
                .attr("class", "chord")
              .selectAll("path")
                .data(chord.chords)
              .enter().append("path")
                .attr("d", d3.svg.chord().radius(innerRadius))
                .style("fill", function(d) { return fill(d.target.index); })
                .style("opacity", 1);

            // Returns an event handler for fading a given chord group.
            function fade(opacity,t) {
              return function(g, i) {
                text_label.text (t ? lookup[i] : "");
                svg.selectAll(".chord path")
                    .filter(function(d) { return d.source.index != i && d.target.index != i; })
                  .transition()
                    .style("opacity", opacity);
              };
            }
        }
  }

  function attribute_pairwise_distribution (id, dim, the_map, only_expanded) {
        var scan_from = only_expanded ? draw_me.edges : self.edges;
        var the_matrix = [];
        for (i = 0 ; i < dim; i+=1) {
            the_matrix.push([]);
            for (j = 0; j < dim; j += 1){
                the_matrix[i].push (0);
            }
        }  
        scan_from.forEach (function (edge) { the_matrix[the_map[attribute_node_value_by_id(self.nodes[edge.source], id)]][the_map[attribute_node_value_by_id(self.nodes[edge.target], id)]] += 1;});
        // check if there are null values
        
        var haz_null = the_matrix.some (function (d, i) { if (i == dim - 1) {return d.some (function (d2) {return d2 > 0;});} return d[dim-1] > 0;});
        if (!haz_null) {
            the_matrix.pop();
            for (i = 0 ; i < dim - 1; i+=1) {
                the_matrix[i].pop();
            }
        }
        
        return the_matrix;
  }
    
  function attribute_cluster_distribution (the_cluster, attribute_id) {
        if (attribute_id && the_cluster) {
            return the_cluster.children.map (function (d) {return (_networkGraphAttrbuteID in d) ? d[_networkGraphAttrbuteID][attribute_id] : null;});
        }
        return null;
  }

  function cluster_info_string (id) {
      var the_cluster = self.clusters[id-1],
          degrees = the_cluster.children.map (function (d) {return d.degree;}),
          attr_info = the_cluster["binned_attributes"];
          
          

      var str = "<strong>" + self.cluster_sizes[id-1] + "</strong> nodes." + 
             "<br>Mean degree <em>" + defaultFloatFormat(d3.mean (degrees)) + "</em>" +
             "<br>Max degree <em>" + d3.max (degrees) + "</em>";
      
      if (attr_info) {
            attr_info.forEach (function (d) { str += "<br>" + d[0] + " <em>" + d[1] + "</em>"});
      }
             
      return str;
  }

  function cluster_pop_on (d) {
      toggle_tooltip (this, true, "Cluster " + d.cluster_id, cluster_info_string (d.cluster_id));
  }

  function cluster_pop_off (d) {
      toggle_tooltip (this, false);
  }

  function expand_cluster_handler (d, do_update) {
    if (d.collapsed) {  
        var new_nodes = self.cluster_sizes[d.cluster_id-1] - 1;
        
        if (new_nodes > max_points_to_render) {
            warning_string = "This cluster is too large to be displayed";
        }
        else {
            var leftover = new_nodes + currently_displayed_objects - max_points_to_render;
            if (leftover > 0) {
              for (k = 0; k < open_cluster_queue.length && leftover > 0; k++) {
                  var cluster = self.clusters[cluster_mapping[open_cluster_queue[k]]];
                  leftover -= cluster.children.length - 1;
                  collapse_cluster(cluster,true);
              }
              if (k || open_cluster_queue.length) {
                  open_cluster_queue.splice (0, k);
              }
            }
    
            if (leftover <= 0) {
                expand_cluster (d, true);
            }
        }
            
        if (do_update) {
            update(false, 0.6);
        }
    }
    return "";
  }

  function collapse_cluster_handler (d, do_update) {
    collapse_cluster(self.clusters[cluster_mapping[d.cluster]]);
    if (do_update) {       
        update(false, 0.4);
    }
    
  }

  function center_cluster_handler (d) {
    d.x = w/2;
    d.y = h/2;
    update(false, 0.4);
  }

  function cluster_box_size (c) {
      return 5*Math.sqrt (c.children.length);
  }

  self.expand_all_clusters = function(e)  {
    self.clusters.forEach (function (x) { expand_cluster_handler (x, false); });
    update (); 
  }

  self.collapse_all_clusters = function(e) {
    self.clusters.forEach (function (x) { if (!x.collapsed) collapse_cluster (x); });
    update();
  }

  self.toggle_hxb2 = function()  {
    self.hide_hxb2 = !self.hide_hxb2;
    update();
  }

  $('#reset_layout').click(function(e) {
    default_layout(clusters, nodes);
    update ();
    e.preventDefault();// prevent the default anchor functionality
    });

  function stratify (array) {
    if (array) {
        var dict = {},
            stratified = [];
        
        array.forEach (function (d) { if (d in dict) {dict[d] += 1;} else {dict[d] = 1;}});
        for (var uv in dict) {
            stratified.push ([uv, dict[uv]]);
        }
        return stratified.sort (function (a,b) {
              return a[0] - b[0];
            });
     }
     return array;
   }

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
