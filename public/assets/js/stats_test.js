$(document).ready(function(){
  drawAnalysisHistory();
  //drawTopTen();
});


function crossfilterBlock(jobs) {

  //Methods 

  // Like d3.time.format, but faster.
  var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse;

  // Various formatters.
  var formatNumber     = d3.format(",d"),
      formatReal       = d3.format(".2f"),
      formatChange     = d3.format("+,d"),
      formatDate       = d3.time.format("%B %d, %Y"),
      formatTime       = d3.time.format("%I:%M %p");

  // A nest operator, for grouping the job list.
  var nestByDate = d3.nest().key(function(d) { return d3.time.day(d.date); });


  function resetFilters() {
    all                     = job.groupAll(),
    date                    = job.dimension(function(d) { return d.date; }),
    dates                   = date.group(d3.time.day),
    sequence                = job.dimension(function(d) { return d.upload_id.sequences; }),
    sequences               = sequence.group();
    site                    = job.dimension(function(d) { return d.upload_id.sites; }),
    sites                   = site.group(),
    cpu_time                = job.dimension(function(d) { return d.cpu_time; }),
    cpu_times               = cpu_time.group(),
    pvalue                  = job.dimension(function(d) { return d.pvalue; }),
    pvalues                 = pvalue.group(),
    oldest_date             = date.bottom(1),
    newest_date             = date.top(1);

  }


  function updateAverages() {

    // Number of jobs per date
    try {
      job_mean = all.value()/dates.size();
      job_median = dates.top(Infinity)[Math.round(dates.top(Infinity).length/2)].value;
      lowest_job_number = dates.top(Infinity)[dates.size() - 1].value;
      highest_job_number = dates.top(1)[0].value;
    } catch (e) {
    }

    try {
      // Number of sequences per job
      sequence_total  = job.groupAll().reduceSum(function(d) { return d.upload_id.sequences; });
      sequence_mean = sequence_total.value()/all.value();
      sequence_median = sequence.top(Infinity)[Math.round(sequence.groupAll().value()/2)].upload_id.sequences;
      lowest_sequence_number = sequence.top(Infinity)[sequence.groupAll().value() - 1].upload_id.sequences;
      highest_sequence_number = sequence.top(1)[0].upload_id.sequences;
    } catch (e) {
    }

    try {
      // Number of sites per job
      site_total  = job.groupAll().reduceSum(function(d) { return d.upload_id.sites; });
      site_mean = site_total.value()/all.value();
      site_median = site.top(Infinity)[Math.round(site.groupAll().value()/2)].upload_id.sites;
      lowest_site_number = site.top(Infinity)[site.groupAll().value() - 1].upload_id.sites;
      highest_site_number = site.top(1)[0].upload_id.sites;
    } catch (e) {
    }

    try {
      // Average CPU time
      cpu_time_total  = job.groupAll().reduceSum(function(d) { return d.cpu_time; });
      cpu_time_mean = cpu_time_total.value()/all.value();
      cpu_time_median = cpu_time.top(Infinity)[Math.round(cpu_time.groupAll().value()/2)].cpu_time;
      lowest_cpu_time_number = cpu_time.top(Infinity)[Math.round(cpu_time.groupAll().value()) - 1].cpu_time;
      highest_cpu_time_number = cpu_time.top(1)[0].cpu_time;
    } catch (e) {
    }

    d3.selectAll("#job-mean").text(formatReal(job_mean));
    d3.selectAll("#job-median").text(formatReal(job_median));
    d3.selectAll("#job-range").text(lowest_job_number + '-' + highest_job_number);
    d3.selectAll("#sequence-mean").text(formatReal(sequence_mean));
    d3.selectAll("#sequence-median").text(formatReal(sequence_median));
    d3.selectAll("#sequence-range").text(lowest_sequence_number + '-' + highest_sequence_number);
    d3.selectAll("#site-mean").text(formatReal(site_mean));
    d3.selectAll("#site-median").text(formatReal(site_median));
    d3.selectAll("#site-range").text(lowest_site_number + '-' + highest_site_number);
    d3.selectAll("#cpu-time-mean").text(formatReal(cpu_time_mean));
    d3.selectAll("#cpu-time-median").text(formatReal(cpu_time_median));
    d3.selectAll("#cpu-time-range").text(lowest_cpu_time_number + '-' + highest_cpu_time_number);

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
      dates                   = date.group(d3.time.day),
      sequence                = job.dimension(function(d) { return d.upload_id.sequences; }),
      sequences               = sequence.group();
      site                    = job.dimension(function(d) { return d.upload_id.sites; }),
      sites                   = site.group(),
      cpu_time                = job.dimension(function(d) { return d.cpu_time; }),
      cpu_times               = cpu_time.group(),
      oldest_date             = date.bottom(1),
      newest_date             = date.top(1),
      job_mean                = 0,
      job_median              = 0,
      lowest_job_number       = 0,
      highest_job_number      = 0,
      sequence_total          = 0,
      sequence_mean           = 0,
      sequence_median         = 0,
      lowest_sequence_number  = 0,
      highest_sequence_number = 0,
      site_total              = 0,
      site_mean               = 0,
      site_median             = 0,
      lowest_site_number      = 0,
      highest_site_number     = 0,
      cpu_time_total          = 0,
      cpu_time_mean           = 0,
      cpu_time_median         = 0,
      lowest_cpu_time_number  = 0,
      highest_cpu_time_number = 0;

  updateAverages();
  resetFilters();

  /* Create a bar chart and use the given css selector as anchor. You can also specify
   * an optional chart group for this chart to be scoped within. When a chart belongs
   * to a specific group then any interaction with such chart will only trigger redraw
   * on other charts within the same chart group. */
  var job_chart = dc.barChart("#job-chart")
    .width(990) // (optional) define chart width, :default = 200
    .height(250) // (optional) define chart height, :default = 200
    .transitionDuration(500) // (optional) define chart transition duration, :default = 500
    // (optional) define margins
    .margins({top: 10, right: 50, bottom: 30, left: 40})
    .dimension(date) // set dimension
    .group(dates) // set group
    // (optional) whether chart should rescale y axis to fit data, :default = false
    //.elasticY(true)
    // (optional) when elasticY is on whether padding should be applied to y axis domain, :default=0
    //.yAxisPadding(100)
    // (optional) whether chart should rescale x axis to fit data, :default = false
    //.elasticX(true)
    // (optional) when elasticX is on whether padding should be applied to x axis domain, :default=0
    //.xAxisPadding(500)
    // define x scale
    .x(d3.time.scale().domain([parseDate(oldest_date[0].created), parseDate(newest_date[0].created)]))
    // (optional) set filter brush rounding
    //.round(d3.time.month.round)
    // define x axis units
    //.xUnits(d3.time.months)
    // (optional) whether bar should be center to its x value, :default=false
    .centerBar(true)
    // (optional) set gap between bars manually in px, :default=2
    //.barGap(1)
    // (optional) render horizontal grid lines, :default=false
    //.renderHorizontalGridLines(true)
    // (optional) render vertical grid lines, :default=false
    //.renderVerticalGridLines(true)
    // (optional) add stacked group and custom value retriever
    //.stack(monthlyMoveGroup, function(d){return d.value;})
    // (optional) you can add multiple stacked group with or without custom value retriever
    // if no custom retriever provided base chart's value retriever will be used
    //.stack(monthlyMoveGroup)
    // (optional) whether this chart should generate user interactive brush to allow range
    // selection, :default=true.
    .brushOn(true)
    // (optional) whether svg title element(tooltip) should be generated for each bar using
    // the given function, :default=no
    .title(function(d) { return "Value: " + d.value; })
    // (optional) whether chart should render titles, :default = false
    .renderTitle(true)
    .on("filtered", function (chart, filter) {updateAverages()});

  /* Create a bar chart and use the given css selector as anchor. You can also specify
   * an optional chart group for this chart to be scoped within. When a chart belongs
   * to a specific group then any interaction with such chart will only trigger redraw
   * on other charts within the same chart group. */
  var sequence_chart = dc.barChart("#sequence-chart")
    .width(990) // (optional) define chart width, :default = 200
    .height(250) // (optional) define chart height, :default = 200
    .transitionDuration(500) // (optional) define chart transition duration, :default = 500
    // (optional) define margins
    .margins({top: 10, right: 50, bottom: 30, left: 40})
    .dimension(sequence) // set dimension
    .group(sequences) // set group
    // (optional) whether chart should rescale y axis to fit data, :default = false
    //.elasticY(true)
    // (optional) when elasticY is on whether padding should be applied to y axis domain, :default=0
    //.yAxisPadding(100)
    // (optional) whether chart should rescale x axis to fit data, :default = false
    //.elasticX(true)
    // (optional) when elasticX is on whether padding should be applied to x axis domain, :default=0
    //.xAxisPadding(500)
    // define x scale
    .x(d3.scale.linear().domain([lowest_sequence_number, highest_sequence_number]))
    // (optional) set filter brush rounding
    //.round(d3.time.month.round)
    // define x axis units
    //.xUnits(d3.time.months)
    // (optional) whether bar should be center to its x value, :default=false
    //.centerBar(true)
    // (optional) set gap between bars manually in px, :default=2
    //.barGap(1)
    // (optional) render horizontal grid lines, :default=false
    //.renderHorizontalGridLines(true)
    // (optional) render vertical grid lines, :default=false
    //.renderVerticalGridLines(true)
    // (optional) add stacked group and custom value retriever
    //.stack(monthlyMoveGroup, function(d){return d.value;})
    // (optional) you can add multiple stacked group with or without custom value retriever
    // if no custom retriever provided base chart's value retriever will be used
    //.stack(monthlyMoveGroup)
    // (optional) whether this chart should generate user interactive brush to allow range
    // selection, :default=true.
    .brushOn(true)
    // (optional) whether svg title element(tooltip) should be generated for each bar using
    // the given function, :default=no
    .title(function(d) { return "Value: " + d.value; })
    // (optional) whether chart should render titles, :default = false
    .renderTitle(true);

  /* Create a bar chart and use the given css selector as anchor. You can also specify
   * an optional chart group for this chart to be scoped within. When a chart belongs
   * to a specific group then any interaction with such chart will only trigger redraw
   * on other charts within the same chart group. */
  var site_chart = dc.barChart("#site-chart")
    .width(990) // (optional) define chart width, :default = 200
    .height(250) // (optional) define chart height, :default = 200
    .transitionDuration(500) // (optional) define chart transition duration, :default = 500
    // (optional) define margins
    .margins({top: 10, right: 50, bottom: 30, left: 40})
    .dimension(site) // set dimension
    .group(sites) // set group
    // (optional) whether chart should rescale y axis to fit data, :default = false
    //.elasticY(true)
    // (optional) when elasticY is on whether padding should be applied to y axis domain, :default=0
    //.yAxisPadding(100)
    // (optional) whether chart should rescale x axis to fit data, :default = false
    //.elasticX(true)
    // (optional) when elasticX is on whether padding should be applied to x axis domain, :default=0
    //.xAxisPadding(500)
    // define x scale
    .x(d3.scale.linear().domain([lowest_site_number, highest_site_number]))
    // (optional) set filter brush rounding
    //.round(0, 10 * 40)
    // define x axis units
    //.xUnits(d3.time.months)
    // (optional) whether bar should be center to its x value, :default=false
    .centerBar(true)
    // (optional) set gap between bars manually in px, :default=2
    //.barGap(1)
    // (optional) render horizontal grid lines, :default=false
    //.renderHorizontalGridLines(true)
    // (optional) render vertical grid lines, :default=false
    //.renderVerticalGridLines(true)
    // (optional) add stacked group and custom value retriever
    //.stack(monthlyMoveGroup, function(d){return d.value;})
    // (optional) you can add multiple stacked group with or without custom value retriever
    // if no custom retriever provided base chart's value retriever will be used
    //.stack(monthlyMoveGroup)
    // (optional) whether this chart should generate user interactive brush to allow range
    // selection, :default=true.
    .brushOn(true)
    // (optional) whether svg title element(tooltip) should be generated for each bar using
    // the given function, :default=no
    .title(function(d) { return "Value: " + d.value; })
    // (optional) whether chart should render titles, :default = false
    .renderTitle(true);

  /* Create a bar chart and use the given css selector as anchor. You can also specify
   * an optional chart group for this chart to be scoped within. When a chart belongs
   * to a specific group then any interaction with such chart will only trigger redraw
   * on other charts within the same chart group. */
  var cpu_time_chart = dc.barChart("#cpu-time-chart")
    .width(990) // (optional) define chart width, :default = 200
    .height(250) // (optional) define chart height, :default = 200
    .transitionDuration(500) // (optional) define chart transition duration, :default = 500
    // (optional) define margins
    .margins({top: 10, right: 50, bottom: 30, left: 40})
    .dimension(cpu_time) // set dimension
    .group(cpu_times) // set group
    // (optional) whether chart should rescale y axis to fit data, :default = false
    //.elasticY(true)
    // (optional) when elasticY is on whether padding should be applied to y axis domain, :default=0
    //.yAxisPadding(100)
    // (optional) whether chart should rescale x axis to fit data, :default = false
    //.elasticX(true)
    // (optional) when elasticX is on whether padding should be applied to x axis domain, :default=0
    //.xAxisPadding(500)
    // define x scale
    .x(d3.scale.linear().domain([lowest_cpu_time_number, highest_cpu_time_number]))
    // (optional) set filter brush rounding
    //.round(d3.time.month.round)
    // define x axis units
    //.xUnits(d3.time.months)
    // (optional) whether bar should be center to its x value, :default=false
    .centerBar(true)
    // (optional) set gap between bars manually in px, :default=2
    //.barGap(1)
    // (optional) render horizontal grid lines, :default=false
    //.renderHorizontalGridLines(true)
    // (optional) render vertical grid lines, :default=false
    //.renderVerticalGridLines(true)
    // (optional) add stacked group and custom value retriever
    //.stack(monthlyMoveGroup, function(d){return d.value;})
    // (optional) you can add multiple stacked group with or without custom value retriever
    // if no custom retriever provided base chart's value retriever will be used
    //.stack(monthlyMoveGroup)
    // (optional) whether this chart should generate user interactive brush to allow range
    // selection, :default=true.
    .brushOn(true)
    // (optional) whether svg title element(tooltip) should be generated for each bar using
    // the given function, :default=no
    .title(function(d) { return "Value: " + d.value; })
    // (optional) whether chart should render titles, :default = false
    .renderTitle(true);

  /* Create a pie chart and use the given css selector as anchor. You can also specify
   * an optional chart group for this chart to be scoped within. When a chart belongs
   * to a specific group then any interaction with such chart will only trigger redraw
   * on other charts within the same chart group. */
  pvalue_chart = dc.pieChart("#pvalue-chart")
      .width(200) // (optional) define chart width, :default = 200
      .height(200) // (optional) define chart height, :default = 200
      .transitionDuration(500) // (optional) define chart transition duration, :default = 350
      // (optional) define color array for slices
      .colors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
      // (optional) define color domain to match your data domain if you want to bind data or color
      .colorDomain([-1750, 1644])
      // (optional) define color value accessor
      .colorAccessor(function(d, i){return d.value;})
      .radius(90) // define pie radius
      // (optional) if inner radius is used then a donut chart will
      // be generated instead of pie chart
      .innerRadius(40)
      .dimension(pvalue) // set dimension
      .group(pvalues) // set group
      // (optional) by default pie chart will use group.key as it's label
      // but you can overwrite it with a closure
      .label(function(d) { return d.data.key + "(" + Math.floor(d.data.value / all.value() * 100) + "%)"; })
      // (optional) whether chart should render labels, :default = true
      .renderLabel(true)
      // (optional) by default pie chart will use group.key and group.value as its title
      // you can overwrite it with a closure
      .title(function(d) { return d.data.key + "(" + Math.floor(d.data.value / all.value() * 100) + "%)"; })
      // (optional) whether chart should render titles, :default = false
      .renderTitle(true);

  dc.renderAll();

}

function drawAnalysisHistory() {
  d3.json("/slac/usage", function(error, jobs) {
    crossfilterBlock(jobs);
  });
}

