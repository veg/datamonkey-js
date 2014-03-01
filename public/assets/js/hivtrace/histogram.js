function render_histogram(graph, histogram_tag) {  
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

  //d3.select ("#histogram_label").html(label);
  $('#indicator').hide();
  $('#results').show();
}

function hivtrace_render_histogram (counts, fit, w, h, id) {
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

