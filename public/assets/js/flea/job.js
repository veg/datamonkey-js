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

  var jobid = $('#job-report').data('jobid');
  var socket_address = document.location.origin;
  var socket = io.connect(socket_address, {
        reconnect: false
      });

  var rate = ($(".progress").data("size") / 20000000) * 1000;
  var was_error = false;

  var tween = function(d, i, a) {
    return d3.interpolateString("0%", "33%");
  }

  // return size to calculate transition time
  var initializeProgress = function() {
    d3.select("#transfer-progress")
      .transition()
      .duration(rate)
      .styleTween("width", tween)
  }

  initializeProgress();

  var changeStatus = function (data) {

    // check phase
    if(data.phase) {

      if(data.phase == 'preparing_data') {
        // if transferring
        d3.select("#transfer-progress")
          .classed({'hidden': false,'progress-bar-warning': false, 'progress-bar-success': true });

        d3.select(".transfer-progress")
          .classed({'hidden': true});

        d3.select("#prepare-progress")
          .classed({'hidden': false, 'progress-bar-warning': true})
          .transition()
          .duration(rate)
          .styleTween("width", tween);

      }

      if(data.phase == 'queued') {
        // if queued
        d3.select("#transfer-progress").classed({'hidden': false, 'progress-bar-warning': false, 'progress-bar-success': true});
        d3.select("#prepare-progress").classed({'hidden': false, 'progress-bar-warning': false, 'progress-bar-success': true});
        d3.select("#queue-progress").classed({'hidden': false, 'progress-bar-warning': true});
      }

      if(data.phase == 'running') {
        d3.select(".progress").classed({'hidden': true});
        d3.select(".job-in-progress").classed({'hidden': false});
      }

    }

    if(data.msg != undefined) {

      d3.select("#standard-output").classed({'hidden': false});
      $('#job-pre').html(data.msg);
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


