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

  var jobid = $('#job-report').data('jobid')
  var socket_address = $('#job-report').data('socket-address')
  var socket = io.connect(socket_address);

  var changeStatus = function (data) {
    //$('.progress .progress-bar').width(data.percentage);
    //data is index and message
    $($(".panel-body")[1]).empty();

    $('.job-status').each(function(index) {

      if($(this).data('index') < data.index ) {
        $(this).attr('class', 'job-status panel panel-success')
      } else if ($(this).data("index") == data.index) {
        $(this).attr('class', 'job-status panel panel-warning')
      }


      if($(this).data('index') == 1  && data.index == 1) {
        Object.keys(data.msg).forEach(function(m) { 

          var phase = $( "<h4></h4>", {
            "text": data.msg[m]["Phase"]
          })

          var ul = $("<ul></ul>");
          Object.keys(data.msg[m]["Information"]).forEach(function(n) { 
            $( "<li></li>", {
              "text": data.msg[m]["Information"][n]
            }).appendTo(ul);

          });

          $($(".panel-body")[1]).append(phase)
          $($(".panel-body")[1]).append(ul)

        });
      }

    });
  }

  var updateQueueWithTorqueId = function (data) {
    //data is index and message
    $('.job-status').each(function(index) {
      if($(this).data('index') == 0 ) {
        $(this).$(".panel_body").text("Ticket Number: " + data);
       }
    });
  }

  socket.on('connected', function () {
    // Start job
    socket.emit('acknowledged', { id: jobid });
  });

  // Status update
  socket.on('status update', function (data) {
    changeStatus(data);
  });

  // torque id
  socket.on('job created', function (data) {
    updateQueueWithTorqueId(data);
  });

  // Completed
  socket.on('completed', function (data) {
    $('.progress .progress-bar').width('100%');

    $('.job-status').each(function(index) {
      $(this).attr('class', 'alert alert-success')
    });

    $.get(jobid + '/results', function(results) {
      //Do an AJAX request to get results
      $('#job-report').html(results);
      initialize_cluster_network_graphs();
      downloadExport();
    });

    socket.disconnect();

  });

  // Error
  socket.on('script error', function (data) {
    jQuery('<div/>', {
          class: 'alert alert-danger',
          html : 'There was an error! Please try again. Message : <code>' + data.msg + '</code>'
      }).insertAfter($('.page-header'));

      socket.disconnect();
  });
}

