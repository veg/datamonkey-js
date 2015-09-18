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

  //localStorage.debug = '*';
  _.templateSettings = {
    evaluate:    /\{\%(.+?)\%\}/g,
    interpolate: /\{\{(.+?)\}\}/g,
    variable    : "rc"
  };

  var status_update_template = _.template(
    $("script.hivtrace-status").html()
  );

  var hivtraceid = $('#hiv-cluster-report').data('hivtraceid')
  var socket_address = document.location.origin;
  var socket = io.connect(socket_address, {
        reconnect: false
      });

  var was_error = false;

  var changeStatus = function (data) {

    var statuses = {
      1 : 'info',
      2 : 'warning',
      3 : 'success'
    }

    var status_update = { statuses : statuses, elems : data };

    // data is index and message
    // If the status update contains a msg, then replace template
    $("#status-update-container").empty();
    var status_update_html = status_update_template(status_update);
    $("#status-update-container").append(status_update_html);

  }

  socket.on('connected', function () {

    // Start job
    socket.emit('acknowledged', { id: hivtraceid });

  });

  socket.on('connect_error', function () {
    if(!was_error) {
      was_error = true;
      datamonkey.errorModal('Could not contact server for job status updates');
    }
  });

  socket.on('connect_timeout', function () {
    datamonkey.errorModal('Could not contact server for job status updates');
  });

  // Status update
  socket.on('status update', function (data) {
    changeStatus(data.msg);
  });

  // Status update
  socket.on('completed', function (data) {

    $('.hivtrace-status').each(function(index) {
      $(this).attr('class', 'alert alert-success')
    });

    $.get(hivtraceid + '/results', function(results) {
      //Do an AJAX request to get results
      location.reload();
      $('#hiv-cluster-report').html(results);
      initialize_cluster_network_graphs();
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

  // get last status update
  try {
    data = JSON.parse($("#last-status-update").text())
    changeStatus(data);
  } catch (e) {}

}


