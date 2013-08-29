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
    // Select all prior alert-blocks and turn them to successes
    $('.alert-block').attr("class", "alert alert-success");
    
    // Update status div
    jQuery('<div/>', {
        class: 'alert alert-block',
        text : data
    }).appendTo('#hiv-cluster-status');
  });

  // Status update
  socket.on('completed', function (data) {
    $('.alert-block').attr("class", "alert alert-success");

     jQuery('<div/>', {
        class: 'alert alert-success',
        text : data
    }).appendTo('#hiv-cluster-status');
  });

  // Error
  socket.on('error', function (data) {
    //Update status div
    //Please try again
    //Close connection
  });

}

