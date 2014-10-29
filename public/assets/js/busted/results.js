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


function init(json) {

  global_test_set = json["test set"].split(',');

  datamonkey.busted.render_summary(json);
  datamonkey.busted.render_histogram("#chart-id", json);
  datamonkey.busted.render_tree('#tree_container', "body", json);

  var fg_rate = json["fits"]["Unconstrained model"]["rate distributions"]["FG"]
  var omegas  = fg_rate.map(function (r) {return r[0];})
  var weights = fg_rate.map(function (r) {return r[1];})

  var dsettings = {
    'log'       : true,
    'legend'    : false,
    'domain'    : [0.00001, 20],
    'dimensions': {'width' : 325, 'height' : 300}
  }

  datamonkey.busted.draw_distribution("FG", omegas, weights, dsettings);


  $("#export-dist-svg").on('click', function(e) { 
    datamonkey.save_image("svg", "#primary-omega-dist"); 
  });

  $("#export-dist-png").on('click', function(e) { 
    datamonkey.save_image("png", "#primary-omega-dist"); 
  });

}

$( document ).ready( function () {
  $(".content").addClass('hidden');
  d3.json ($("#job-report").data('jobid') + '/results', function (json) {
    init(JSON.parse(json.results));

    var svg = d3.select('#tree_container').select("svg");
    add_dc_legend(svg);
    $(".loader").addClass('hidden');
    $(".content").removeClass('hidden');
  });

});
