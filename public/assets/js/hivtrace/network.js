$(document).ready(function(){
  setupJob();
});

var intervalID = window.setInterval(getTime, 1000);

function pad (s) {
  if(s.length == 1) {
    return "0" + s;
  }
  return s;
}

function getTime() {

  var created_time = new Date($('#job-timer').data('created') * 1000);
  var time_difference = new Date() - created_time;
  var hh = pad(String(Math.floor(time_difference / 1000 / 60 / 60)));
  time_difference -= hh * 1000 * 60 * 60;
  var mm = pad(String(Math.floor(time_difference / 1000 / 60)));
  time_difference -= mm * 1000 * 60;
  var ss = pad(String(Math.floor(time_difference / 1000)));
  $('#job-timer .time').html(hh + ':'+ mm  + ':'+ ss);
}

function setupJob() {

  var hivtraceid = $('#hiv-cluster-report').data('hivtraceid')
  var socket_address = $('#hiv-cluster-report').data('socket-address')
  var socket = io.connect(socket_address);

  var changeStatus = function (data) {
    $('.progress .progress-bar').width(data.percentage);

    //data is index and message
    $('.job-status').each(function(index) {
      if($(this).data('index') < data.index ) {
        $(this).attr('class', 'job-status alert alert-success')
      } else if ($(this).data("index") == data.index) {
        $(this).attr('class', 'job-status alert alert-warning')
      }
    });
  }

  socket.on('connected', function () {
    // Start job
    socket.emit('acknowledged', { id: hivtraceid });
  });

  // Status update
  socket.on('status update', function (data) {
    changeStatus(data);
  });

  // Status update
  socket.on('completed', function (data) {
    $('.progress .progress-bar').width('100%');

    $('.job-status').each(function(index) {
      $(this).attr('class', 'alert alert-success')
    });

    $.get(hivtraceid + '/results', function(results) {
      //Do an AJAX request to get results
      $('#hiv-cluster-report').html(results);
      initializeClusterNetworkGraphs();
    });

    socket.disconnect();

  });

  // Error
  socket.on('error', function (data) {
    jQuery('<div/>', {
          class: 'alert alert-danger',
          text : 'There was an error! Please try again. Error : ' + data.msg
      }).insertAfter($('.page-header'));

      socket.disconnect();
  });
}


