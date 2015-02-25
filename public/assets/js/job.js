$(document).ready(function(){
  setupJob();
  var current_status = $("#job-status-animation").data("status");
  colorStatusButton(current_status);
  datamonkey.jobQueue('#job-queue-panel');
});


function pad (s) {
  if(s.length == 1) {
    return "0" + s;
  }
  return s;
}

function jobWaitTime() {
  var created_time = new Date($('#job-wait-time').data('created'));
  var time_difference = new Date() - created_time;
  if(time_difference > 0) {
    var hh = pad(String(Math.floor(time_difference / 1000 / 60 / 60)));
    time_difference -= hh * 1000 * 60 * 60;
    var mm = pad(String(Math.floor(time_difference / 1000 / 60)));
    time_difference -= mm * 1000 * 60;
    var ss = pad(String(Math.floor(time_difference / 1000)));
    $('#job-wait-time').html(' ' + hh + ':'+ mm  + ':'+ ss);
  }
}

function jobRuntime() {
  var created_time = new Date($('#job-run-time').data('started'));
  var time_difference = new Date() - created_time;
  if(time_difference > 0) {
    var hh = pad(String(Math.floor(time_difference / 1000 / 60 / 60)));
    time_difference -= hh * 1000 * 60 * 60;
    var mm = pad(String(Math.floor(time_difference / 1000 / 60)));
    time_difference -= mm * 1000 * 60;
    var ss = pad(String(Math.floor(time_difference / 1000)));
    $('#job-run-time').html(' ' + hh + ':'+ mm  + ':'+ ss);
  }
}


function setupJob() {

  var jobid = $('#job-report').data('jobid')
  var socket_address = $('#job-report').data('socket-address')
  var socket = io.connect(socket_address, {
        reconnect: false
      });

  var was_error = false;

  if($('#job-run-time').data('started') != "undefined") {
    d3.select("#run-time-row").classed({'hidden': false})
    var intervalID = window.setInterval(jobRuntime, 1000);
  } else if($('#job-wait-time').data('created')) {
    d3.select("#wait-time-row").classed({'hidden': false})
    var intervalID = window.setInterval(jobWaitTime, 1000);
  }


  var changeStatus = function (data) {
    console.log(data);

    //data is index and message
    colorStatusButton(data.phase)
    if(data.msg != undefined) {
      d3.select("#standard-output").classed({'hidden': false})
      $('#job-pre').html(data.msg)
    }

    // Update times

    // If phase is queue, then update jobWaitTime
    if(data.creation_time) {
      d3.select("#wait-time-row").classed({'hidden': false})
      $('#job-wait-time').data('created', data.creation_time);
      var intervalID = window.setInterval(jobWaitTime, 1000);
    }

    if(data.start_time) {
      // If phase is running, then update jobRunningTime
      d3.select("#wait-time-row").classed({'hidden': true})
      $('#job-run-time').data('started', data.start_time);
      var intervalID = window.setInterval(jobRuntime, 1000);
    } else {
      d3.select("#run-time-row").classed({'hidden': true})
    }

    // Update job queue panel
    datamonkey.jobQueue('#job-queue-panel');


  }

  var updateQueueWithTorqueId = function (torque_id) {
    d3.select("#torque_id").classed({'hidden': false})
    $("#torque_id").text(torque_id);
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

    if(data) {
      changeStatus(data);
      if('torque_id' in data) {
        updateQueueWithTorqueId(data.torque_id);
      }
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

function colorStatusButton(status) {

  console.log(datamonkey.helpers.capitalize(status));
  $("#job-status-text").text(datamonkey.helpers.capitalize(status));

  var circle = d3.selectAll(".job-status circle")
               .style("fill-opacity", 0.5);

  var circle = d3.selectAll("." + status)
               .style("fill-opacity", 0.9);
  
}
