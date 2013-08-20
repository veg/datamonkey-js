$(document).ready(function(){
  setupJob();
});

function setupJob() {

  console.log("setting job up");
  var hivclusterid = $('.container').data('hivclusterid')
  var socket = io.connect('http://datamonkey-dev:3001');

  socket.on('connected', function (data) {

    // Status update
    socket.on('status update', function (data) {
      //Update status div
      console.log('got a status update');
      jQuery('<div/>', {
          class: 'alert alert-success',
          text : data.msg
      }).appendTo('#container');

    });

    // Error
    socket.on('error', function (data) {
      //Update status div

      //Please try again

      //Close connection

    });

    // Completed
    socket.on('completed', function (data) {

      console.log('completed');

      // Update results div
      //$('.container').append(data);
      // Close connection

    });

    // Start job
    socket.emit('spawn', { id: hivclusterid });

  });

}
