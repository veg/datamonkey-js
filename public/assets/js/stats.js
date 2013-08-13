$(document).ready(function(){
  drawAnalysisHistory();
  //drawTopTen();
});

// Like d3.time.format, but faster.
var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse;

// Various formatters.
var formatNumber     = d3.format(",d"),
    formatReal       = d3.format(".2f"),
    formatChange     = d3.format("+,d"),
    formatDate       = d3.time.format("%B %d, %Y"),
    formatTime       = d3.time.format("%I:%M %p");


function crossfilterBlock(jobs) {

  //Methods 
  function updateAverages() {
    // Number of jobs per date

    tmp_all_dates = [];

    all_dates = avg_dates.reduceCount().top(Infinity);
    all_dates.forEach(function(d, i) {
      if(d.value) {
        tmp_all_dates.push(d);
      }
    });

    all_dates = tmp_all_dates;
    job_mean = all.value()/all_dates.length;
    job_median = all_dates[Math.round((all_dates.length-1)/2)].value;
    lowest_job_number = all_dates[all_dates.length - 1].value;
    highest_job_number = all_dates[0].value;

    // Number of sequences per job
    sequence_total  = job.groupAll().reduceSum(function(d) { return d.upload_id.sequences; });
    sequence_mean = sequence_total.value()/all.value();
    sequence_median = avg_sequence.top(Infinity)[Math.round(avg_sequence.groupAll().value()/2)].upload_id.sequences;
    lowest_sequence_number = avg_sequence.top(Infinity)[avg_sequence.groupAll().value() - 1].upload_id.sequences;
    highest_sequence_number = avg_sequence.top(1)[0].upload_id.sequences;

    // Number of sites per job
    site_total  = job.groupAll().reduceSum(function(d) { return d.upload_id.sites; });
    site_mean = site_total.value()/all.value();
    site_median = avg_site.top(Infinity)[Math.round(avg_site.groupAll().value()/2)].upload_id.sites;
    lowest_site_number = avg_site.top(Infinity)[avg_site.groupAll().value() - 1].upload_id.sites;
    highest_site_number = avg_site.top(1)[0].upload_id.sites;

    // Average CPU time
    cpu_time_total  = job.groupAll().reduceSum(function(d) { return d.cpu_time; });
    cpu_time_mean = cpu_time_total.value()/all.value();
    cpu_time_median = avg_cpu_time.top(Infinity)[Math.round(avg_cpu_time.groupAll().value()/2)].cpu_time;
    lowest_cpu_time_number = avg_cpu_time.top(Infinity)[Math.round(avg_cpu_time.groupAll().value()) - 1].cpu_time;
    highest_cpu_time_number = avg_cpu_time.top(1)[0].cpu_time;

    d3.selectAll("#job-mean").text("Mean: " + formatReal(job_mean));
    d3.selectAll("#job-median").text("Median: " + formatReal(job_median));
    d3.selectAll("#job-range").text("Range: " + lowest_job_number + '-' + highest_job_number);
    d3.selectAll("#sequence-mean").text("Mean: " + formatReal(sequence_mean));
    d3.selectAll("#sequence-median").text("Median: " + formatReal(sequence_median));
    d3.selectAll("#sequence-range").text("Range: " + lowest_sequence_number + '-' + highest_sequence_number);
    d3.selectAll("#site-mean").text(formatReal("Mean: " + site_mean));
    d3.selectAll("#site-median").text(formatReal("Median: " + site_median));
    d3.selectAll("#site-range").text("Range: " + lowest_site_number + '-' + highest_site_number);
    d3.selectAll("#cpu-time-mean").text("Mean: " + formatReal(cpu_time_mean));
    d3.selectAll("#cpu-time-median").text("Median:" + formatReal(cpu_time_median));
    d3.selectAll("#cpu-time-range").text("Range:" + lowest_cpu_time_number + '-' + highest_cpu_time_number);

  }


  // A little coercion, since the CSV is untyped.
  jobs.forEach(function(d, i) {
    d.index = i;
    d.date = parseDate(d.created);
  });


  //Attributes
  // Create the crossfilter for the relevant dimensions and groups.
  var job                     = crossfilter(jobs),
      all                     = job.groupAll(),
      date                    = job.dimension(function(d) { return d.date; }),
      avg_date                = job.dimension(function(d) { return d.date; }),
      dates                   = date.group(d3.time.day),
      avg_dates               = avg_date.group(d3.time.day),
      sequence                = job.dimension(function(d) { return d.upload_id.sequences; }),
      avg_sequence            = job.dimension(function(d) { return d.upload_id.sequences; }),
      sequences               = sequence.group();
      site                    = job.dimension(function(d) { return d.upload_id.sites; }),
      avg_site                = job.dimension(function(d) { return d.upload_id.sites; }),
      sites                   = site.group(),
      cpu_time                = job.dimension(function(d) { return d.cpu_time; }),
      avg_cpu_time            = job.dimension(function(d) { return d.cpu_time; }),
      cpu_times               = cpu_time.group(),
      pvalue                  = job.dimension(function(d) { return d.pvalue; }),
      modelstring             = job.dimension(function(d) { return d.modelstring; }),
      oldest_date             = date.bottom(1),
      newest_date             = date.top(1);
      job_mean                = 0,
      job_median              = 0,
      lowest_job_number       = 0,
      highest_job_number      = 0,
      sequence_total          = 0,
      sequence_mean           = 0,
      sequence_median         = 0,
      lowest_sequence_number  = avg_sequence.top(Infinity)[avg_sequence.groupAll().value() - 1].upload_id.sequences,
      highest_sequence_number = avg_sequence.top(1)[0].upload_id.sequences,
      site_total              = 0,
      site_mean               = 0,
      site_median             = 0,
      lowest_site_number      = avg_site.top(Infinity)[avg_site.groupAll().value() - 1].upload_id.sites,
      highest_site_number     = avg_site.top(1)[0].upload_id.sites,
      cpu_time_total          = 0,
      cpu_time_mean           = 0,
      cpu_time_median         = 0,
      lowest_cpu_time_number  = avg_cpu_time.top(Infinity)[Math.round(avg_cpu_time.groupAll().value()) - 1].cpu_time,
      highest_cpu_time_number = avg_cpu_time.top(1)[0].cpu_time;

  updateAverages();

  var charts = [
    // Job Count
    barChart()
        .dimension(date)
        .group(dates)
        .round(d3.time.day.round)
      .x(d3.time.scale()
        .domain([parseDate(oldest_date[0].created), parseDate(newest_date[0].created)])
        .rangeRound([0, 10 * 90])),

    // Sequence Count
    barChart()
        .dimension(sequence)
        .group(sequences)
      .x(d3.scale.linear()
        .domain([lowest_sequence_number, highest_sequence_number])
        .rangeRound([0, 10 * 40])),

    // Sites Count
    barChart()
        .dimension(site)
        .group(sites)
      .x(d3.scale.linear()
        .domain([lowest_site_number, highest_site_number])
        .rangeRound([0, 10 * 40])),

    // CPU Time
    barChart()
        .dimension(cpu_time)
        .group(cpu_times)
      .x(d3.scale.linear()
        .domain([lowest_cpu_time_number, highest_cpu_time_number])
        .rangeRound([0, 10 * 40])),

  ];

  // Given our array of charts, which we assume are in the same order as the
  // .chart elements in the DOM, bind the charts to the DOM and render them.
  // We also listen to the chart's brush events to update the display.
  var chart = d3.selectAll(".chart")
      .data(charts)
      .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAllAndAverages); });

  var top_ten_pvalues = d3.selectAll(".top-ten-pvalues")
      .data([function(d) {return topTenList(d, pvalue);}]);

  var top_ten_modelstrings = d3.selectAll(".top-ten-modelstrings")
      .data([function(d) {return topTenList(d, modelstring);}]);

  // Render the total.
  d3.selectAll("#total")
      .text(formatNumber(job.size()));

  renderAllAndAverages();

  // Renders the specified chart or list.
  function render(method) {
    d3.select(this).call(method);
  }

  // Whenever the brush moves, re-rendering everything.
  function renderAll() {
    chart.each(render);
    d3.select("#active").text(formatNumber(all.value()));
  }

  function renderAllAndAverages() {
    renderAll();
    top_ten_pvalues.each(render);
    top_ten_modelstrings.each(render);
    updateAverages();
  } 

  window.filter = function(filters) {
    filters.forEach(function(d, i) { charts[i].filter(d); });
    renderAll();
  };

  window.reset = function(i) {
    charts[i].filter(null);
    renderAll();
  };


}

function drawAnalysisHistory() {
  d3.json("/slac/usage", function(error, jobs) {
    crossfilterBlock(jobs);
  });
}

function barChart() {
  if (!barChart.id) barChart.id = 0;

  var margin = {top: 10, right: 10, bottom: 20, left: 10},
      x,
      y = d3.scale.linear().range([100, 0]),
      id = barChart.id++,
      axis = d3.svg.axis().orient("bottom"),
      brush = d3.svg.brush(),
      brushDirty,
      dimension,
      group,
      round;

  function chart(div) {
    var width = x.range()[1],
        height = y.range()[0];

    y.domain([0, group.top(1)[0].value]);

    div.each(function() {
      var div = d3.select(this),
          g = div.select("g");

      // Create the skeletal chart.
      if (g.empty()) {
        div.select(".title").append("a")
            .attr("href", "javascript:reset(" + id + ")")
            .attr("class", "reset")
            .text("reset")
            .style("display", "none");

        g = div.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        g.append("clipPath")
            .attr("id", "clip-" + id)
          .append("rect")
            .attr("width", width)
            .attr("height", height);

        g.selectAll(".bar")
            .data(["background", "foreground"])
          .enter().append("path")
            .attr("class", function(d) { return d + " bar"; })
            .datum(group.all());

        g.selectAll(".foreground.bar")
            .attr("clip-path", "url(#clip-" + id + ")");

        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(axis);

        // Initialize the brush component with pretty resize handles.
        var gBrush = g.append("g").attr("class", "brush").call(brush);
        gBrush.selectAll("rect").attr("height", height);
        gBrush.selectAll(".resize").append("path").attr("d", resizePath);
      }

      // Only redraw the brush if set externally.
      if (brushDirty) {
        brushDirty = false;
        g.selectAll(".brush").call(brush);
        div.select(".title a").style("display", brush.empty() ? "none" : null);
        if (brush.empty()) {
          g.selectAll("#clip-" + id + " rect")
              .attr("x", 0)
              .attr("width", width);
        } else {
          var extent = brush.extent();
          g.selectAll("#clip-" + id + " rect")
              .attr("x", x(extent[0]))
              .attr("width", x(extent[1]) - x(extent[0]));
        }
      }
      g.selectAll(".bar").attr("d", barPath);
    });

    function barPath(groups) {

      var path = [],
          i = -1,
          n = groups.length,
          d;
      while (++i < n) {
        d = groups[i];
        path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
      }
      return path.join("");
    }

    function resizePath(d) {
      var e = +(d == "e"),
          x = e ? 1 : -1,
          y = height / 3;
      return "M" + (.5 * x) + "," + y
          + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
          + "V" + (2 * y - 6)
          + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
          + "Z"
          + "M" + (2.5 * x) + "," + (y + 8)
          + "V" + (2 * y - 8)
          + "M" + (4.5 * x) + "," + (y + 8)
          + "V" + (2 * y - 8);
    }
  }

  brush.on("brushstart.chart", function() {
    var div = d3.select(this.parentNode.parentNode.parentNode);
    div.select(".title a").style("display", null);
  });

  brush.on("brush.chart", function() {
    var g = d3.select(this.parentNode),
        extent = brush.extent();
    if (round) g.select(".brush")
        .call(brush.extent(extent = extent.map(round)))
      .selectAll(".resize")
        .style("display", null);
    g.select("#clip-" + id + " rect")
        .attr("x", x(extent[0]))
        .attr("width", x(extent[1]) - x(extent[0]));
    dimension.filterRange(extent);
  });

  brush.on("brushend.chart", function() {
    if (brush.empty()) {
      var div = d3.select(this.parentNode.parentNode.parentNode);
      div.select(".title a").style("display", "none");
      div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
      dimension.filterAll();
    }
  });

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return x;
    x = _;
    axis.scale(x);
    brush.x(x);
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return y;
    y = _;
    return chart;
  };

  chart.dimension = function(_) {
    if (!arguments.length) return dimension;
    dimension = _;
    return chart;
  };

  chart.filter = function(_) {
    if (_) {
      brush.extent(_);
      dimension.filterRange(_);
    } else {
      brush.clear();
      dimension.filterAll();
    }
    brushDirty = true;
    return chart;
  };

  chart.group = function(_) {
    if (!arguments.length) return group;
    group = _;
    return chart;
  };

  chart.round = function(_) {
    if (!arguments.length) return round;
    round = _;
    return chart;
  };

  return d3.rebind(chart, brush, "on");

}

function topTenList(div, dimension) {

  var dimension_group = dimension.group().reduceCount();
  var top_ten_values = dimension_group.top(10);
  var total = dimension.groupAll().reduceCount().value();

  // Make percentages
  top_ten_values.forEach(function(d, i) {
    d.index = i + 1;
    d.percent = Math.floor(d.value/total * 10000)/100;
  });

  // Insert top ten values
  div.each(function() {

    // Do not remove headers
    var trs = d3.select(this).selectAll("tr");
    trs[0].shift();
    trs.remove();

    var trs = d3.select(this).selectAll("tr");
    trs[0].shift();

    var tr = trs
        .attr("class", "top-ten-item")
        .data(top_ten_values)
        .enter().append("tr");

    var td = tr.append("td")
          .text(function(d) { return d.index; });

    var td = tr.append("td")
          .text(function(d) { return d.key; });

    var td = tr.append("td")
          .text(function(d) { return d.value; });

    var td = tr.append("td")
          .text(function(d) { return d.percent; });
  });
}

