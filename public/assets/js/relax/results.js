//function init(json) {
//  console.log(json);
//}

//$( document ).ready( function () {
//  $(".content").addClass('hidden');
//  d3.json ($("#job-report").data('jobid') + '/results', function (json) {
//    init(JSON.parse(json.results));
//    $(".loader").addClass('hidden');
//    $(".content").removeClass('hidden');
//  });
//});

$( document ).ready( function () {

  datamonkey.relax();

  $(".content").addClass('hidden');
  d3.json ($("#job-report").data('jobid') + '/results', function (json) {
    render(json);
    $(".loader").addClass('hidden');
    $(".content").removeClass('hidden');
  });

  //TODO : Change these to data- binds
  $("#export-primary-omega-svg").on('click', function(e) { 
    datamonkey.save_image("svg", "#primary_omega_plot"); 
  });

  $("#export-primary-omega-png").on('click', function(e) { 
    datamonkey.save_image("png", "#primary_omega_plot"); 
  });

  $("#export-phylo-svg").on('click', function(e) { 
    datamonkey.save_image("svg", "#tree_container"); 
  });

  $("#export-phylo-png").on('click', function(e) { 
    datamonkey.save_image("png", "#tree_container"); 
  });



});


