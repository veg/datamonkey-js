var global_test_set;

var width  = 600, //$(container_id).width(),
    height = 600, //$(container_id).height()
    color_scheme = d3.scale.category10(),
    branch_omegas = {},
    branch_p_values = {},
    alpha_level = 0.05,
    omega_format = d3.format (".3r"),
    prop_format = d3.format (".2p"),
    fit_format = d3.format (".2f"),
    branch_table_format = d3.format (".4f"),
    analysis_data = null,
    render_color_bar = true,
    which_model = "Constrained model",
    color_legend_id = 'color_legend';

var tree = d3.layout.phylotree("body")
    .size([height, width])
    .separation (function (a,b) {return 0;});
    //.node_span (function (a) {if (a.children && a.children.length) return 1; return isNaN (parseFloat (a["attribute"]) * 100) ? 1 : parseFloat (a["attribute"]) * 100; });

var container_id = '#tree_container';

var svg = d3.select(container_id).append("svg")
    .attr("width", width)
    .attr("height", height);

        
var scaling_exponent = 0.33;       

var omega_color = d3.scale.pow().exponent(scaling_exponent)                    
                    .domain([0, 0.25, 1, 5, 10])
                    .range([ "#5e4fa2", "#3288bd", "#e6f598","#f46d43","#9e0142"])
                    .clamp(true);
    
// *** HANDLERS ***
//$("#json_file").on ("change", function (e) {

//  // FileList object
//  var files = e.target.files; 
//  if (files.length == 1) {
//    var f = files[0];
//    var reader = new FileReader();
//    reader.onload = (function(theFile) {
//      return function(e) {
//        analysis_data = JSON.parse (e.target.result);
//        render_bs_rel (analysis_data);
//      };
//    })(f);
//    reader.readAsText(f);
//  }

//});

$("#expand_spacing").on("click", function (e) {
  tree.spacing_x (tree.spacing_x() + 1).update(true);
});

$("#compress_spacing").on ("click", function (e) {
  tree.spacing_x (tree.spacing_x() - 1).update(true);
})

$("#color_or_grey").on ("click", function (e) {
  if ($(this).data ('color-mode') == 'gray') {
      $(this).data ('color-mode', 'color');
      d3.select (this).text ("Use grayscale");
      omega_color.range([ "#5e4fa2", "#3288bd", "#e6f598","#f46d43","#9e0142"]);
  } else {
      $(this).data ('color-mode', 'gray');
      d3.select (this).text ("Use color");
      omega_color.range(["#EEE", "#BBB","#999","#333","#000"]);    
  }
  branch_omegas = render_bs_rel_tree (analysis_data, which_model)[1];
  tree.update ();
  e.preventDefault();
});

$("#show_color_bar").on ("click", function (e) {
     render_color_bar = !render_color_bar;
     if ($(this).data ('color-bar') == 'on') {
        $(this).data ('color-mode', 'off');
        d3.select (this).html ("Show &omega; color legend");
    } else {
        $(this).data ('color-mode', 'on');
        d3.select (this).html ("Hide &omega; color legend");
    }
    render_color_scheme (color_legend_id);
    e.preventDefault();
});

$("#show_model").on ("click", function (e) {
     if ($(this).data ('model') == 'Unconstrained') {
        $(this).data ('model', 'Unconstrained model');
        d3.select (this).html ("Show Unconstrained model Model");
    } else {
        $(this).data ('model', 'Constrained model');
        d3.select (this).html("Show Branch-site Model");
    }
    which_model = $(this).data ('model');
    branch_omegas = render_bs_rel_tree (analysis_data, which_model)[1];
    tree.layout ();
    e.preventDefault();
});



function default_tree_settings () {
    tree.branch_length (null);
    tree.branch_name (null);
    tree.node_span ('equal');
    tree.options ({'draw-size-bubbles' : false}, false);
    tree.options ({'selectable' : false}, false);
    tree.font_size (18);
    tree.scale_bar_font_size (14);
    tree.node_circle_size (6);
    tree.spacing_x (35, true);
    //tree.style_nodes (node_colorizer);
    tree.style_edges (edge_colorizer);
    //tree.selection_label (current_selection_name);
}



                    

function render_color_scheme (svg_container) {

    var svg = d3.select ("#" + svg_container).selectAll ("svg").data ([omega_color.domain()]);
    svg.enter().append ("svg");
    svg.selectAll ("*").remove();
   
    if (render_color_bar) {
        var bar_width  = 70,
            bar_height = 300,
            margins = {'bottom' : 30,
                       'top'    : 15,
                       'left'   : 40,
                       'right'  : 2};
                       
        svg.attr ("width", bar_width)
           .attr ("height", bar_height);
       
       
    
        this_grad = svg.append ("defs").append ("linearGradient")
                    .attr ("id", "_omega_bar")
                    .attr ("x1", "0%")
                    .attr ("y1", "0%")
                    .attr ("x2", "0%")
                    .attr ("y2", "100%");
       
        var omega_scale = d3.scale.pow().exponent(scaling_exponent)                    
                         .domain(d3.extent (omega_color.domain()))
                         .range ([0,1]),
            axis_scale = d3.scale.pow().exponent(scaling_exponent)                    
                         .domain(d3.extent (omega_color.domain()))
                         .range ([0,bar_height - margins['top']-margins['bottom']]);
                     
                    
       omega_color.domain().forEach (function (d) { 
        this_grad.append ("stop")
                 .attr ("offset",  "" + omega_scale (d) * 100 + "%")
                 .style ("stop-color", omega_color (d));
       });
   
       var g_container = svg.append ("g").attr ("transform", "translate(" + margins["left"] + "," + margins["top"] + ")");
   
       g_container.append ("rect").attr ("x", 0)
                          .attr ("width", bar_width - margins['left']-margins['right'])
                          .attr ("y", 0)
                          .attr ("height", bar_height - margins['top']-margins['bottom'])
                          .style ("fill", "url(#_omega_bar)");
 
   
        var draw_omega_bar  =  d3.svg.axis().scale(axis_scale)
                                 .orient ("left")
                                 .tickFormat (d3.format(".1r"))
                                 .tickValues ([0,0.01,0.1,0.5,1,2,5,10]);
                             
        var scale_bar = g_container.append("g");
        scale_bar.style ("font-size", "14")
                       .attr  ("class", "omega-bar")
                       .call (draw_omega_bar);
                   
        scale_bar.selectAll ("text")
                       .style ("text-anchor", "right");
                   
        var x_label =_label = scale_bar.append ("g").attr("class", "omega-bar");
        x_label = x_label.selectAll("text").data(["\u03C9"]);
        x_label.enter().append ("text");
        x_label.text (function (d) {return d})
                .attr  ("transform", "translate(" + ( bar_width - margins['left']-margins['right'])*0.5 + "," + (bar_height - margins['bottom']) + ")")
                .style ("text-anchor", "middle")
                .style ("font-size", "18")
                .attr ("dx", "0.0em")
                .attr ("dy", "0.1em");
    }               
}        

function render_bs_rel_tree (json, model_id) {
    tree(json["fits"][model_id]["tree string"]).svg(svg);
   
    var svg_defs = svg.selectAll ("defs");

    if (svg_defs.empty()) {
      svg_defs = svg.append ("defs");
    }

    svg_defs.selectAll ("*").remove();
    gradID = 0;
    var local_branch_omegas = {};

    var fitted_distributions = json["fits"][model_id]["rate distributions"];
    
    for (var b in fitted_distributions) {       
       var rateD = fitted_distributions[b];

       if (rateD.length == 1) {
          local_branch_omegas[b] = {'color': omega_color (rateD[0][0])};
       } else {
          gradID ++;
          var grad_id = "branch_gradient_" + gradID;
          //create_gradient (svg_defs, grad_id, rateD);
          local_branch_omegas[b] = {'grad' : grad_id};
       }

       local_branch_omegas[b]['omegas'] = rateD;
       local_branch_omegas[b]['tooltip'] = "<b>" + b + "</b>";
       local_branch_omegas[b]['distro'] = "";
        rateD.forEach (function (d,i) {
            var omega_value = d[0] > 1e20 ? "&infin;" : omega_format (d[0]),
                omega_weight = prop_format (d[1]);
        
            local_branch_omegas[b]['tooltip'] += "<br/>&omega;<sub>" + (i+1) + "</sub> = " + omega_value + 
                                           " (" + omega_weight + ")";
            if (i) {
                local_branch_omegas[b]['distro'] += "<br/>";
            }                               
            local_branch_omegas[b]['distro'] += "&omega;<sub>" + (i+1) + "</sub> = " + omega_value + 
                                           " (" + omega_weight + ")";
        });
        local_branch_omegas[b]['tooltip'] += "<br/><i>p = " + omega_format (json["test results"]["p"]) + "</i>";
    }    
    
    tree.style_edges (function (element, data) {
        edge_colorizer (element, data);
    });

    branch_lengths = {};
    tree.get_nodes().forEach (function (d) {if (d.parent) {branch_lengths[d.name] = tree.branch_length()(d);}});
    
    return [branch_lengths, local_branch_omegas];
}

function add_dc_legend(svg) {

  var dc_legend = svg.append("g")
      .attr("class", "dc-legend")
      .attr("transform", "translate(15,40)")

      var fg_item = dc_legend.append("g")
        .attr("class","dc-legend-item")
        .attr("transform", "translate(0,0)")

        fg_item.append("rect")
          .attr("width", "13")
          .attr("height", "13")
          .attr("fill", "red")

        fg_item.append("text")
          .attr("x", "15")
          .attr("y", "11")
          .text("Foreground")

      var bg_item = dc_legend.append("g")
        .attr("class","dc-legend-item")
        .attr("transform", "translate(0,18)")

        bg_item.append("rect")
          .attr("width", "13")
          .attr("height", "13")
          .attr("fill", "gray")

        bg_item.append("text")
          .attr("x", "15")
          .attr("y", "11")
          .text("Background")

}
                
function render_bs_rel (json) {

    default_tree_settings();
    branch_p_values = {};
    
    var rate_distro_by_branch = {},
        branch_count = 0,
        selected_count = 0,
        tested_count = 0;
    
    var for_branch_table = [];
    
    var tree_info = render_bs_rel_tree (json, "Unconstrained model");
    
    var branch_lengths   = tree_info[0],
        tested_branches  = {};
    
    branch_omegas = tree_info[1];
    
    for (var p in json["test results"]) {
        branch_p_values[p] = json["test results"]["p"];
        if (branch_p_values[p] <= 0.05) {
            selected_count++;
        }
        //if (json["test results"]["tested"] > 0) {
        //    tested_branches[p] = true;
        //    tested_count += 1;
        //}
    }
    
    var fitted_distributions = json["fits"]["Unconstrained model"]["rate distributions"];
    
    for (var b in fitted_distributions) {
       //for_branch_table.push ([b + (tested_branches[b] ? "" : " (not tested)"),branch_lengths[b],0,0,0]);
       for_branch_table.push ([b + (tested_branches[b] ? "" : ""),branch_lengths[b],0,0,0]);
       try {
            for_branch_table[branch_count][2] = json["test results"][b]["LRT"];
            for_branch_table[branch_count][3] = json["test results"][b]["p"];
            for_branch_table[branch_count][4] = json["test results"][b]["uncorrected p"];
       }
       catch (e) {
       }
       
       var rateD = fitted_distributions[b];
       rate_distro_by_branch[b] = rateD; 
       for_branch_table[branch_count].push (branch_omegas[b]['distro']);
       branch_count+=1;
    }
    
    //render_color_scheme (color_legend_id);
    
    // render summary data
    
    var total_tree_length =  d3.format("g")(json["fits"]["Unconstrained model"]["tree length"]); 
    
    for_branch_table = for_branch_table.sort (function (a,b) {return a[4]-b[4];});
    //make_distro_plot (for_branch_table[0]);

    //d3.select ('#summary-method-name').text (json['version']);
    d3.select ('#summary-test-result').text (json['test results']['p'] <= 0.05 ? "evidence" : "no evidence");
    d3.select ('#summary-test-pvalue').text (branch_table_format(json['test results']['p']));
    d3.select ('#summary-pmid').text ("PubMed ID " + json['PMID'])
                               .attr ("href", "http://www.ncbi.nlm.nih.gov/pubmed/" + json['PMID']);
    d3.select ('#summary-total-runtime').text (format_run_time(json['timers']['overall']));
    d3.select ('#summary-total-branches').text (branch_count);
    d3.select ('#summary-tested-branches').text (tested_count);
    d3.select ('#summary-selected-branches').text (selected_count);
    
    has_background = json['background'];
        
    var model_rows = [[],[]];
    
    if (has_background) {
        model_rows.push ([]);
    }
    
    for (k = 0; k < 2 + has_background; k++)  {
        var access_key,
            secondary_key,
            only_distro = 0;
            
        if (k == 0) {
            access_key = 'Unconstrained model';
            secondary_key = 'FG';
            model_rows[k].push ('Unconstrained Model');
            only_distro = 0;
        } else {
            if (has_background && k == 1) {
                model_rows[k].push ('(background branches)');
                secondary_key = 'BG';
                only_distro = 1;
            } else {
                access_key = 'Constrained model';
                model_rows[k].push ('Constrained Model');                    
                secondary_key = 'FG';
                only_distro = 0;
            }
        }
        
            model_rows[k].push (only_distro ? '' : fit_format(json['fits'][access_key]['log-likelihood']));
            model_rows[k].push (only_distro ? '' : json['fits'][access_key]['parameters']);
            model_rows[k].push (only_distro ? '' : fit_format(json['fits'][access_key]['AIC-c']));
            model_rows[k].push (only_distro ? '' : format_run_time(json['fits'][access_key]['runtime']));
            model_rows[k].push (only_distro ? '' : fit_format(json['fits'][access_key]['tree length']));

        for (j = 0; j < 3; j++) {
         model_rows[k].push (   omega_format(json['fits'][access_key]['rate distributions'][secondary_key][j][0]) + " (" +
                                prop_format(json['fits'][access_key]['rate distributions'][secondary_key][j][1]) + ")");
        }
    }
                               
    model_rows = d3.select ('#summary-model-table').selectAll ("tr").data (model_rows);
    model_rows.enter().append ('tr');
    model_rows.exit().remove ();
    model_rows = model_rows.selectAll ("td").data (function (d) {return d;});
    model_rows.enter().append ("td");
    model_rows.html (function (d) {return d;});
    
    
    tree.layout();

    $("#export-phylo-png").on('click', function(e) { 
      saveImage("png", "#tree_container"); 
    });

    $("#export-phylo-svg").on('click', function(e) { 
      saveImage("svg", "#tree_container"); 
    });


}

function format_run_time (seconds) {
    var duration_string = "";
    seconds = parseFloat (seconds);
    var split_array = [Math.floor (seconds/(24*3600)) ,Math.floor (seconds/3600) % 24, Math.floor (seconds/60) % 60,seconds % 60],
        quals = ["d.", "hrs.", "min.", "sec."];
        
    split_array.forEach (function (d,i) {
        if (d) {
            duration_string += " " + d + " " + quals[i];
        }
    });
    
    return duration_string;
}

function edge_colorizer (element, data) {

    var coloration = branch_omegas[data.target.name];

    if (coloration) {

      if ('color' in coloration) {
        element.style ('stroke', coloration['color']);
      } else {
        element.style ('stroke', 'url(#' + coloration['grad'] + ')');
      }

      $(element[0][0]).tooltip({'title' : coloration['tooltip'], 'html' : true, 'trigger' : 'hover', 'container' : 'body', 'placement' : 'auto'});

   }

    // Color the FG a different color
    var is_foreground = false;

    if(global_test_set.indexOf(data.target.name) != -1) {
      is_foreground = true;
    }

    element.style ('stroke-width', branch_p_values[data.target.name] <= alpha_level ? '12' : '5')
           .style ('stroke', is_foreground ? 'red' : 'gray')
           .style ('stroke-linejoin', 'round')
           .style ('stroke-linejoin', 'round')
           .style ('stroke-linecap', 'round');
    
}

function init(json) {
  global_test_set = json["test set"].split(',');
  render_bs_rel(json);
  render_busted_histogram("#chart-id", json);

  var fg_rate = json["fits"]["Unconstrained model"]["rate distributions"]["FG"]
  var omegas  = fg_rate.map(function (r) {return r[0];})
  var weights = fg_rate.map(function (r) {return r[1];})

  var dsettings = {
    'log'       : true,
    'legend'    : false,
    'domain'    : [0.00001, 20],
    'dimensions': {'width' : 325, 'height' : 300}
  }

  drawDistribution("FG", omegas, weights, dsettings);

  $("#export-dist-svg").on('click', function(e) { 
    saveImage("svg", "#primary-omega-dist"); 
  });

  $("#export-dist-png").on('click', function(e) { 
    saveImage("png", "#primary-omega-dist"); 
  });

}


$( document ).ready( function () {

  $(".content").addClass('hidden');
  d3.json ($("#job-report").data('jobid') + '/results', function (json) {
    init(JSON.parse(json.results));
    add_dc_legend(svg);
    $(".loader").addClass('hidden');
    $(".content").removeClass('hidden');
  });

  //$("#json_file").on("change", function (e) {
  //    var files = e.target.files; // FileList object

  //    if (files.length == 1) {
  //      var f = files[0];
  //      var reader = new FileReader();

  //      reader.onload = (function(theFile) {
  //        return function(e) {
  //            analysis_data = JSON.parse (e.target.result);
  //            init(analysis_data);
  //        };
  //      })(f);

  //      reader.readAsText(f);
  //    }
  //});

});
