$(document).ready(function(){
  setupJob();
  var current_status = $("#job-status-animation").data("status");
  animateStatusButton(current_status);
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
  $('#job-timer .time').html(' ' + hh + ':'+ mm  + ':'+ ss);
}

function setupJob() {

  var jobid = $('#job-report').data('jobid')
  var socket_address = $('#job-report').data('socket-address')
  var socket = io.connect(socket_address, {
        reconnect: false
      });

  var was_error = false;


  var changeStatus = function (data) {

    //data is index and message
    animateStatusButton(data.phase)

    if(data.msg != undefined) {
      $('#job-pre').html(data.msg)
    }

  }

  var updateQueueWithTorqueId = function (torque_id) {
    $("#torque_id").text(' ' + torque_id);
  }

  socket.on('connect_error', function () {
    if(!was_error) {
      was_error = true;
      datamonkey.errorModal('Could not contact server for job status updates');
    }
  });

  socket.on('connect_timeout', function () {
    datamonkey.errorModal('Could not contact server for job status updates');
  });

  socket.on('connected', function () {
    // Start job
    socket.emit('acknowledged', { id: jobid });
  });

  // Status update
  socket.on('status update', function (data) {
    changeStatus(data);
    if('torque_id' in data) {
      updateQueueWithTorqueId(data.torque_id);
    }
  });

  // Torque id
  socket.on('job created', function (data) {
    updateQueueWithTorqueId(data.msg);
  });

  // Completed
  socket.on('completed', function (data) {
    $('.progress .progress-bar').width('100%');

    $('.job-status').each(function(index) {
      $(this).attr('class', 'job-status panel panel-success')
    });

    $.get(jobid, function(results) {
      //Do an AJAX request to get results
      location.reload();
    });

    socket.disconnect();

  });

  // Error
  socket.on('script error', function (data) {
    datamonkey.errorModal(data.msg);
  });

}

function animateStatusButton(status) {

  function transition(element, start, end) {
    var duration = 2000;
    element.transition()
      .duration(duration)
      .attr("r", end)
      .each("end", function() { d3.select(this).call(transition, end, start); });
  }
  
  minRadius = 23;
  maxRadius = 27;

  var circle = d3.selectAll(".job-status circle")
               .style("fill-opacity", 0.5)
               .transition().duration(0);

  var circle = d3.selectAll("." + status)
               .style("fill-opacity", 0.9)
               .call(transition, minRadius, maxRadius);
  
}

