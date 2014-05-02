$(document).ready(function(){

  if(!inProgress()) {
    createButtonsFromAttributes();
    getAttributeMap();
  }

});

function inProgress() {
  return $('.progress').length > 0;
}

function createButtonsFromAttributes() {
  // Get list of world country names
  var world_ids_url = "/assets/js/hivtrace/world-country-names.tsv";
  var json_url = $('#network_tag').data('url');


  d3.json(json_url, function(obj) {
    // Filter down each attribute
    // Get attributes from every object, get uniques for each
    // [node.attributes.YEAR_OF_SAMPLING for node in obj.Nodes]
    // years_of_sampling = obj.Nodes[iterator].attributes.YEAR_OF_SAMPLING
    // d3.set(years_of_sampling)

    //TODO: Generalize attributes

    // Countries 
    var map_countries = function(node) {
      return node.attributes.COUNTRY;
    }

    //var unique_countries = d3.set(obj.Nodes.map(map_countries));
    var unique_countries = d3.set(obj.Nodes.map(map_countries));

    //Add list
    d3.select(".country-list").selectAll("li")
    .data(unique_countries.values())
    .enter().append("li")
    .append('a')
    .text(function(d) { 
      return country_codes[d]; 
    });

    // Years of Sampling
    var map_years_of_sampling = function(node) {
      return node.attributes.YEAR_OF_SAMPLING;
    }

    var unique_years = d3.set(obj.Nodes.map(map_years_of_sampling));

    //Add list
    d3.select(".year-list").selectAll("li")
    .data(unique_years.values())
    .enter().append("li")
    .append('a')
    .text(function(d) { return d; });

    // Subtype
    var map_subtype = function(node) {
      return node.attributes.SUBTYPE;
    }

    var unique_subtypes = d3.set(obj.Nodes.map(map_subtype));

    //Add list
    d3.select(".subtype-list").selectAll("li")
    .data(unique_subtypes.values())
    .enter().append("li")
    .append('a')
    .text(function(d) { return d; });

  });

}

var clusterNetworkGraph = function (json, network_container, network_status_string, 
                                histogram_tag, histogram_label) {

  var w = 850,
      h = 800,
      popover = null,
      cluster_sizes,
      cluster_mapping = {},
      l_scale = 5000,   // link scale
      graph = json,     // the raw JSON network object
      nodes,            // node objects filtered down to contain only the connected ones
      edges,            // edges between nodes
      clusters,         // cluster 'nodes', used either as fixed cluster anchors, or 
                        // to be a placeholder for the cluster
      max_points_to_render = 400,
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

  /*------------ D3 globals and SVG elements ---------------*/
  var defaultFloatFormat = d3.format(",.2f");

  var network_layout = d3.layout.force()
    .on("tick", tick)
    .charge(function(d) { if (d.cluster_id) return -50-2*d.children.length; return -50*Math.sqrt(d.degree); })
    .linkDistance(function(d) { return Math.max(d.length*l_scale,1); })
    .linkStrength (function (d) { if (d.support != undefined) { return 2*(0.5-d.support);} return 1;})
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

  function default_layout (clusters, nodes, exclude_cluster_ids) {
        init_layout = get_initial_xy (nodes, cluster_sizes.length, exclude_cluster_ids);
        clusters = init_layout.filter (function (v,i,obj) { return  !(typeof v.cluster_id === "undefined");});
        nodes = nodes.map (function (v) {v.x += v.dx/2; v.y += v.dy/2; return v;});
        clusters.forEach (collapse_cluster); 
        return [clusters, nodes];
    }


  /*------------ Constructor ---------------*/

  function initial_json_load() {
    connected_links = [];
    total = 0;
    exclude_cluster_ids = {};
    cluster_sizes = [];

    graph.Nodes.forEach (function (d) { 
      if (typeof cluster_sizes[d.cluster-1]  === "undefined") {
        cluster_sizes[d.cluster-1] = 1;
      } else {
        cluster_sizes[d.cluster-1] ++;
      }});
     
    if (cluster_sizes.length > max_points_to_render) {
      var sorted_array = cluster_sizes.map (function (d,i) { 
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
    singletons = graph.Nodes.filter (function (v,i) { return v.cluster === null; }).length; nodes = graph.Nodes.filter (function (v,i) { if (v.cluster && typeof exclude_cluster_ids[v.cluster]  === "undefined"  ) {connected_links[i] = total++; return true;} return false;  });
    edges = graph.Edges.filter (function (v,i) { return connected_links[v.source] != undefined && connected_links[v.target] != undefined});
    edges = edges.map (function (v,i) {v.source = connected_links[v.source]; v.target = connected_links[v.target]; v.id = i; return v;});

    compute_node_degrees(nodes, edges);

    r = default_layout(clusters, nodes, exclude_cluster_ids);
    clusters = r[0];
    nodes = r[1];
    clusters.forEach (function (d,i) {cluster_mapping[d.cluster_id] = i;});
     
    update();
 
  }  

  /*------------ Update layout code ---------------*/
  function update_network_string (draw_me) {
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

    var draw_me = prepare_data_to_graph(); 
    
    network_layout.nodes(draw_me.all)
        .links (draw_me.edges)
        .start ();
        
    update_network_string (draw_me);  
        
    var link = network_svg.selectAll(".link")
        .data(draw_me.edges, function (d) {return d.id;});
        
    link.exit().remove();
    
    var link_enter = link.enter().append("line")
        .attr("class", function (d) { if (d.removed) return "link removed"; return "link";  });
        
    var directed_links = link_enter.filter (function (d) {return d.directed;})
      .attr("marker-end", "url(#arrowhead)");

    var rendered_nodes = network_svg.selectAll(".node")
        .data(draw_me.nodes, function (d) {return d.id;});
        
        
    rendered_nodes.enter().append("circle")
        .attr("class", "node")
        .attr("r", function (d) { return  3+Math.sqrt(d.degree);} )
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; })
        .style("fill", function(d) { return node_color (d); })
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
      .style("fill", function(d) { return cluster_color (d); })
      .on ("click", click_cluster)
      .on ("mouseover", cluster_pop_on)
      .on ("mouseout", cluster_pop_off)
      .call(network_layout.drag().on("dragstart", cluster_pop_off));

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
  function compute_node_degrees(nodes, egdes) {
      for (var n in nodes) {
          nodes[n].degree = 0;
      }
      
      for (var e in edges) {
          nodes[edges[e].source].degree++;
          nodes[edges[e].target].degree++;
      }
  }

  function node_color(d) {
    return "#fd8d3c";
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

  function collapse_cluster (x, keep_in_q) {
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
      var the_cluster = clusters[id-1],
          degrees = the_cluster.children.map (function (d) {return d.degree;});

      var cluster_mean = compute_mean_path(id, graph.Nodes, graph.Edges, cluster_sizes);

      return "<strong>" + cluster_sizes[id-1] + "</strong> nodes." + 
             "<br>Mean degree <em>" + defaultFloatFormat(d3.mean (degrees)) + "</em>" +
             "<br>Max degree <em>" + d3.max (degrees) + "</em>" +
             "<br>Mean Path Length <em>" + cluster_mean.toFixed(2) + "</em>";
  }

  function cluster_pop_on (d) {
      toggle_tooltip (this, true, "Cluster " + d.cluster_id, cluster_info_string (d.cluster_id));
  }

  function cluster_pop_off (d) {
      toggle_tooltip (this, false);
  }

  function expand_cluster_handler (d, do_update) {
    var new_nodes = cluster_sizes[d.cluster_id-1];
    var leftover = new_nodes + currently_displayed_objects - max_points_to_render;
    if (leftover > 0) {
      for (k = 0; k < open_cluster_queue.length && leftover > 0; k++) {
          var cluster = clusters[cluster_mapping[open_cluster_queue[k]]];
          leftover -= cluster.children.length - 1;
          collapse_cluster (cluster,true);
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

  function collapse_cluster_handler (d, do_update) {
    collapse_cluster (clusters[cluster_mapping[d.cluster]]);
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

  $('#expand_all_clusters').click(function(e) {
    clusters.forEach (function (x) { expand_cluster_handler (x, false); });
    update (); 
    e.preventDefault();// prevent the default anchor functionality
    });

  $('#collapse_all_clusters').click(function(e) {
    clusters.forEach (function (x) { collapse_cluster (x); });
    update();
    e.preventDefault();// prevent the default anchor functionality
    });

  $('#reset_layout').click(function(e) {
    default_layout(clusters, nodes);
    update ();
    e.preventDefault();// prevent the default anchor functionality
    });

  /*------------ Event Functions ---------------*/
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

  function bind_cluster_button_events (d, element) {
      $('#cluster_expand_button').on('click', function (e) {
          expand_cluster_handler (d, true);
          toggle_popover (element, false);
      });
      $('#cluster_collapse_button').on('click', function (e) {
          collapse_cluster_handler (d, true);
          toggle_popover (element, false);
      });
      $('#cluster_center_button').on('click', function (e) {
          center_cluster_handler (d);
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
        bind_cluster_button_events (d, element);
     } else {
          if (turn_on == false && popover != undefined) {
              popover.popover('destroy');
              popover = undefined;
          }
    }
  }
  initial_json_load();       
}

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
  computeNodeDegrees(obj.Nodes, obj.Edges)
  computeMeanPathLengths(obj.Nodes, obj.Edges)
  var node_array = obj.Nodes.map(function(d) {return [d.id, d.cluster, d.degree, d.mean_path_length]});
  node_array.unshift(['ID', 'Cluster', 'Degree', 'Mean Path Length'])
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


$(document).ready(function(){});

$("form").submit(function() {

  //Trigger elements
  $( "input[name='distance_threshold']" ).trigger('focusout');
  $( "input[name='min_overlap']" ).trigger('focusout');
  validateFile();


  $(this).next('.help-block').remove();

  if($(this).find(".has-error").length > 0) {
    $("#form-has-error").show();
    return false;
  }

  $("#form-has-error").hide();
  return true;

});

var validateFile = function() {

  var selector = "#trace-upload";
  var input_field = "input[type='file']";
  $(selector).removeClass('has-error');


  $(selector).next('.help-div').remove();

  // Ensure that file is not empty
  if($(input_field).val().length == 0) {

    $(selector).addClass('has-error');

    var help_div = jQuery('<div/>', {
          class: 'col-lg-9',
      });

    var help_span = jQuery('<span/>', {
          class: 'help-block',
          text : 'Field is empty'
      });

      $(selector).append(help_div.append(help_span));

    return false;
  } 

  $(selector).removeClass('has-error');
  return true;
}

// Validate an element that has min and max values
var validateElement = function () {

  // Remove any non-numeric characters
  $(this).val($(this).val().replace(/[^\.0-9]/g, ''));

  // Check that it is not empty
  if($(this).val().length == 0) {
    // Empty 
    $(this).next('.help-block').remove();
    $(this).parent().removeClass('has-success');
    $(this).parent().addClass('has-error');

    jQuery('<span/>', {
          class: 'help-block',
          text : 'Field is empty'
      }).insertAfter($(this));

  } else if($(this).val() < $(this).data('min')) {

    // We're being cheated
    $(this).next('.help-block').remove();
    $(this).parent().removeClass('has-success');
    $(this).parent().addClass('has-error');

    jQuery('<span/>', {
          class: 'help-block',
          text : 'Parameter must be between ' + $(this).data('min') + ' and ' + $(this).data('max')
      }).insertAfter($(this));

  } else if($(this).val() > $(this).data('max')) {

    // They're being too kind
    $(this).next('.help-block').remove();
    $(this).parent().removeClass('has-success');
    $(this).parent().addClass('has-error');
    jQuery('<span/>', {
          class: 'help-block',
          text : 'Parameter must be between ' + $(this).data('min') + ' and ' + $(this).data('max')
      }).insertAfter($(this));

  } else {
    // Give them green. They like that.
    $(this).parent().removeClass('has-error');
    $(this).parent().addClass('has-success');
    $(this).next('.help-block').remove();
  }
 
}

function ValidateEmail(email) {
  if($(this).find("input[name='receive_mail']")[0].checked) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if(regex.test($(this).find("input[name='mail']").val())) {
       // Give them green. They like that.
      $(this).removeClass('has-error');
      $(this).addClass('has-success');
      $(this).next('.help-block').remove();
    } else {
      $(this).next('.help-block').remove();
      $(this).removeClass('has-error');
      $(this).removeClass('has-success');
      $(this).addClass('has-error');
      var span = jQuery('<span/>', {
            class: 'help-block col-lg-9 pull-right',
            text : 'Invalid Email'
        }).insertAfter($(this));
    }
  } else {
    $(this).removeClass('has-error');
    $(this).removeClass('has-success');
    $(this).next('.help-block').remove();
  }
}


$( "input[name='distance_threshold']" ).focusout(validateElement);
$( "input[name='min_overlap']" ).focusout(validateElement);
$( ".mail-group" ).change(ValidateEmail);

function render_histogram(graph, histogram_tag, histogram_label) {  
  var defaultFloatFormat = d3.format(",.2f");
  var histogram_w = 300,
  histogram_h = 300;

  hivtrace_render_histogram(graph["Degrees"]["Distribution"], 
                            graph["Degrees"]["fitted"], 
                            histogram_w, 
                            histogram_h, 
                            histogram_tag);
  var label = "Network degree distribution is best described by the <strong>" + graph["Degrees"]["Model"] + "</strong> model, with &rho; of " + 
             defaultFloatFormat(graph["Degrees"]["rho"]);
             
  if (graph["Degrees"]["rho CI"] != undefined) {
        label += " (95% CI " + defaultFloatFormat(graph["Degrees"]["rho CI"][0]) + " - " + defaultFloatFormat(graph["Degrees"]["rho CI"][1]) + ")";
  }

  d3.select (histogram_label).html(label);
  //$('#indicator').hide();
  //$('#results').show();

}

function hivtrace_render_histogram(counts, fit, w, h, id) {
    var margin = {top: 10, right: 30, bottom: 30, left: 30},
                width = w - margin.left - margin.right,
                height = h - margin.top - margin.bottom;
    
    var x = d3.scale.linear()
            .domain([0, counts.length+1])
            .range([0, width]);
            
    var y = d3.scale.log()
            .domain ([1, d3.max (counts)])
            .range  ([height,0]);
            
    var total = d3.sum(counts);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
        
    var histogram_svg = d3.select(id).selectAll("svg");

    if (histogram_svg != undefined) {
        histogram_svg.remove();
    }
    
    histogram_svg = d3.select(histogram_tag).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    
    var bar = histogram_svg.selectAll(".bar")
    .data(counts.map (function (d) { return d+1; }))
    .enter().append("g")
    .attr("class", "bar")
    .attr("transform", function(d,i) { return "translate(" + x(i+1) + "," + y(d) + ")"; });
      
    bar.append("rect")
        .attr("x", 1)
        .attr("width", function (d,i) {return x(i+2) - x(i+1) - 1;})
        .attr("height", function(d) { return height - y(d); })
        .append ("title").text (function (d,i) { return "" + counts[i] + " nodes with degree " + (i+1);});

  if (fit != undefined) {    
      var fit_line = d3.svg.line()
          .interpolate("linear")
          .x(function(d,i) { return x(i+1) + (x(i+1)-x(i))/2; })
          .y(function(d) { return y(1+d*total); });
      histogram_svg.append("path").datum(fit)
        .attr("class", "line")
        .attr("d", function(d) { return fit_line(d); });
  }
    
    histogram_svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);    
}

$(document).ready(function(){
  if(!in_progress()) {
    initialize_cluster_network_graphs();
  }
});

function in_progress() {
  return $('.progress').length > 0;
}

var initialize_cluster_network_graphs = function () {

  var network_container     = '#network_tag',
      network_status_string = '#network_status_string';
      histogram_tag         = '#histogram_tag',
      histogram_label       = '#histogram_label',
      csvexport_label       = '#csvexport';


  //Initialize clusternetworkgraph with json url
  var json_url = $(network_container).data('url');
  d3.json(json_url, function(graph) {
    clusterNetworkGraph(graph, network_container, network_status_string);
    exportCSVButton(graph, csvexport_label);
    render_histogram(graph, histogram_tag, histogram_label);
  });

  if($('#lanl-trace-results').length > 0) {

    // Only if the comparison was done
    var lanl_network_container     = '#lanl_network_tag',
        lanl_network_status_string = '#lanl_network_status_string';
        lanl_histogram_tag         = '#lanl_histogram_tag',
        lanl_histogram_label       = '#lanl_histogram_label',
        lanl_csvexport_label       = '#csvexport-lanl';

    d3.json(json_url, function(graph) {
      clusterNetworkGraph(graph, lanl_network_container, lanl_network_status_string);
      exportCSVButton(graph, lanl_csvexport_label);
      render_histogram(graph, lanl_histogram_tag, lanl_histogram_label);
    });
  }
}

$(document).ready(function(){
  setupJob();
});

var intervalID = window.setInterval(getTime, 1000);

function pad (s) {
  if(s.length == 1) {
    return "0" + s;
  }
  return s;
}

function getTime() {

  var created_time = new Date($('#job-timer').data('created') * 1000);
  var time_difference = new Date() - created_time;
  var hh = pad(String(Math.floor(time_difference / 1000 / 60 / 60)));
  time_difference -= hh * 1000 * 60 * 60;
  var mm = pad(String(Math.floor(time_difference / 1000 / 60)));
  time_difference -= mm * 1000 * 60;
  var ss = pad(String(Math.floor(time_difference / 1000)));
  $('#job-timer .time').html(hh + ':'+ mm  + ':'+ ss);

}

function setupJob() {

  var hivtraceid = $('#hiv-cluster-report').data('hivtraceid')
  var socket_address = $('#hiv-cluster-report').data('socket-address')
  var socket = io.connect(socket_address);

  var changeStatus = function (data) {
    $('.progress .progress-bar').width(data.percentage);

    //data is index and message
    $('.job-status').each(function(index) {
      if($(this).data('index') < data.index ) {
        $(this).attr('class', 'job-status alert alert-success')
      } else if ($(this).data("index") == data.index) {
        $(this).attr('class', 'job-status alert alert-warning')
      }
    });
  }

  socket.on('connected', function () {
    // Start job
    socket.emit('acknowledged', { id: hivtraceid });
  });

  // Status update
  socket.on('status update', function (data) {
    changeStatus(data);
  });

  // Status update
  socket.on('completed', function (data) {
    $('.progress .progress-bar').width('100%');

    $('.job-status').each(function(index) {
      $(this).attr('class', 'alert alert-success')
    });

    $.get(hivtraceid + '/results', function(results) {
      //Do an AJAX request to get results
      $('#hiv-cluster-report').html(results);
      initialize_cluster_network_graphs();
      downloadExport();
    });

    socket.disconnect();

  });

  // Error
  socket.on('error', function (data) {
    jQuery('<div/>', {
          class: 'alert alert-danger',
          html : 'There was an error! Please try again. Message : <code>' + data.msg + '</code>'
      }).insertAfter($('.page-header'));

      socket.disconnect();
  });
}

function compute_shortest_paths(cluster, edges) {

  // Floyd-Warshall implementation
  var distances = {}

  var nodes =  cluster.nodes;
  node_ids = []
  nodes.forEach(function(n) { node_ids.push(n.id)});

  // Step 0: We need to filter out edges that only exist within the cluster
  // we're looking at
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

function getAttributeMap() {
  var hivtraceid = $('#hiv-cluster-report').data('hivtraceid')
  $.get(hivtraceid + '/attributemap', function(attribute_map) {
    console.log(attribute_map);
  });
}
