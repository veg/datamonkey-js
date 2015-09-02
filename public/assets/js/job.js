$(document).ready(function() {
  setupJob();

});

var job_start_time    = 0,
    job_creation_time = 0;

function jobSubmittedAt(creation_time) {

  if(moment() > creation_time) {
    d3.select("#job-created").text(creation_time.fromNow());
  } else {
    d3.select("#job-created").text('less than a minute ago');
  }

}

function jobRuntime(start_time) {

  var zero = d3.format("02d");
  hours = moment().diff(start_time, 'hours');
  mins  = moment().diff(start_time, 'minutes') % 60;
  secs  = moment().diff(start_time, 'seconds') % 60;

  d3.select("#job-run-time").text(zero(hours) + ':' + zero(mins) + ':' + zero(secs) );

}

function setupJob() {

  var jobid = $('#job-report').data('jobid');
  var socket_address = $('#job-report').data('socket-address');

  var socket = io.connect(socket_address, {
        reconnect: false
      });

  var was_error = false;

  d3.json(jobid + '/info', function(data) {

    if(data.status == 'aborted') {

      d3.select('#job-status-text').html('aborted')
      job_creation_time = moment(data.creation_time);
      setInterval(jobSubmittedAt, 1000, job_creation_time);

    } else {
      job_start_time    = moment(data.start_time);
      job_creation_time = moment(data.creation_time);

      if(job_start_time) {
        setInterval(jobRuntime, 1000, job_start_time);
        d3.select('#job-status-text').html('running')
        d3.select("#job-info-pane").classed({ 'bs-callout-danger bs-callout-warning bs-callout-success': false })
        d3.select("#job-info-pane").classed({ 'bs-callout-warning' : true })
      }

      if(job_creation_time) {
        setInterval(jobSubmittedAt, 1000, job_creation_time);
      }
    }



  });

  var changeStatus = function (data) {

    if(data.msg != undefined) {
      d3.select("#standard-output").classed({'hidden' : false});
      $('#job-pre').html(data.msg);
    }

    if(data.creation_time && !job_creation_time) {

      job_creation_time = moment(data.creation_time);

      if(job_creation_time) {
        setInterval(jobSubmittedAt, 100, job_creation_time);
      }

    }

    if(data.start_time && !job_start_time) {

      job_start_time = moment(data.start_time);
      if(job_start_time) {
        setInterval(jobRuntime, 100, job_start_time);
      }

    } 

    if(job_start_time) {

      d3.select('#job-status-text').html('running');
      d3.select("#job-info-pane").classed({ 'bs-callout-danger bs-callout-warning bs-callout-success': false });
      d3.select("#job-info-pane").classed({ 'bs-callout-warning' : true });

    }

  }

  var updateQueueWithTorqueId = function (torque_id) {
    d3.select("#torque_id").classed({'hidden': false});
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


  $('#job-cancel-button').on('click', function () {

   d3.select(this).classed({ 'disabled' : true })

   d3.json($('#job-report').data("jobid") + "/cancel", function(error, json) {
      if (error) {
        return console.warn(error);
        datamonkey.errorModal('job could not be cancelled');
      } else {
        datamonkey.errorModal('job cancelled');
        d3.select('#job-status-text').html('aborted');
        d3.select("#job-run-time").classed({'hidden' : true});
        d3.select("#job-info-pane").classed({ 'bs-callout-danger bs-callout-warning bs-callout-success': false });
        d3.select("#job-info-pane").classed({ 'bs-callout-danger' : true });
      }
    }); 

  });

}
