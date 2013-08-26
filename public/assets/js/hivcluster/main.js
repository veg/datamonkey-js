$(document).ready(function(){
  setupJob();
});

function setupJob() {

  console.log("setting job up");
  var hivclusterid = $('#hiv-cluster-status').data('hivclusterid')
  var socket = io.connect('http://datamonkey-dev:3001');

  socket.on('connected', function (data) {
    // Start job
    socket.emit('acknowledged', { id: hivclusterid });
  });

  // Status update
  socket.on('status update', function (data) {
    //Update status div
    jQuery('<div/>', {
        class: 'alert alert-success',
        text : data
    }).appendTo('#hiv-cluster-status');
  });

  // Status update
  socket.on('completed', function (data) {
     jQuery('<div/>', {
        class: 'alert alert-success',
        text : data
    }).appendTo('#hiv-cluster-status');

    $.get(hivclusterid + '/results', function(results) {
      //Do an AJAX request to get results
      jQuery('<pre/>', {
          text : results.hiv_cluster.graph_dot
      }).appendTo('#hiv-cluster-results');

      jQuery('<pre/>', {
          text : results.hiv_cluster.cluster_csv
      }).appendTo('#hiv-cluster-results');
    });
  });

  // Error
  socket.on('error', function (data) {
    //Update status div
    //Please try again
    //Close connection
  });

}

