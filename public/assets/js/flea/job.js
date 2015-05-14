$(document).ready(function(){
  setupJob();

  $("#job-stdout-copy-button").on('click', function (e) {
    e.preventDefault();
  }).each(function () {
    $(this).zclip({
      path: 'http://www.steamdev.com/zclip/js/ZeroClipboard.swf',
      copy: function() {
        return $("#job-pre").text();
      }
    });
  });

});

function setupJob() {

  var jobid = $('#job-report').data('jobid')
  var socket_address = $('#job-report').data('socket-address')
  var socket = io.connect(socket_address, {
        reconnect: false
      });

  var was_error = false;

  var changeStatus = function (data) {

    if(data.msg != undefined) {
      d3.select("#standard-output").classed({'hidden': false})
      $('#job-pre').html(data.msg)
      $("#job-pre").scrollTop($("#job-pre")[0].scrollHeight);
      $("#job-stdout-copy-button").on('click', function (e) {
        e.preventDefault();
      }).each(function () {
        $(this).zclip({
          path: 'http://www.steamdev.com/zclip/js/ZeroClipboard.swf',
          copy: function() {
            return $("#job-pre").text();
          }
        });
      });

    }

  }

  // Job Connection Error
  socket.on('connect_error', function () {
    if(!was_error) {
      was_error = true;
      datamonkey.errorModal('Could not contact server for job status updates');
    }
  });

  // Job Timeout
  socket.on('connect_timeout', function () {
    datamonkey.errorModal('Could not contact server for job status updates');
  });

  // Job Start
  socket.on('connected', function () {
    socket.emit('acknowledged', { id: jobid });
  });

  // Job Status Update
  socket.on('status update', function (data) {
    if(data) {
      changeStatus(data);
    }
  });

  // Job Completed
  socket.on('completed', function (data) {

    $.get(jobid, function(results) {
      //Do an AJAX request to get results
      location.reload();
    });

    socket.disconnect();

  });

  // Job Error
  socket.on('script error', function (data) {
    datamonkey.errorModal(data.msg);
  });

}


