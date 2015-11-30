var SetIntervalMixin = {
  componentWillMount: function() {
    this.intervals = [];
  },
  setInterval: function() {
    this.intervals.push(setInterval.apply(null, arguments));
  },
  componentWillUnmount: function() {
    this.intervals.map(clearInterval);
  }
};

var Job = React.createClass({displayName: "Job",

  mixins: [SetIntervalMixin],
  getInitialState: function() {
    return {seconds: 0};
  },
  componentDidMount: function() {
    this.setInterval(this.tick, 1000); // Call a method on the mixin
  },
  tick: function() {
    this.setState({ 
                    running_time : this.timeDiff(this.props.job.start_time),
                    queue_time : this.getQueueTime()
                  });
  },
  timeDiff : function(start_time) {
    if(start_time) {
      var zero = d3.format("02d"),
      hours = moment().diff(start_time, 'hours'),
      mins  = moment().diff(start_time, 'minutes') % 60,
      secs  = moment().diff(start_time, 'seconds') % 60,
      diff = zero(hours) + ':' + zero(mins) + ':' + zero(secs);
    } else {
      diff = '-';
    }
    return diff;
  },
  getQueueTime() {
    var qtime = '-';
    if(this.props.job.creation_time && !this.props.job.start_time) {
      qtime = this.timeDiff(this.props.job.creation_time);
    }
    return qtime;
  },
  render: function() {
      this.props.job.formatted_time = moment(this.props.job.creation_time).format('lll');
      return (
        React.createElement("tr", null, 
          React.createElement("td", null, this.props.job.id), 
          React.createElement("td", null, this.props.job.status), 
          React.createElement("td", null, this.props.job.type), 
          React.createElement("td", null, this.props.job.sequences), 
          React.createElement("td", null, this.props.job.sites), 
          React.createElement("td", null, this.state.running_time), 
          React.createElement("td", null, this.props.job.formatted_time), 
          React.createElement("td", null, this.state.queue_time)
        )
      );
  }

});

var JobTable = React.createClass({displayName: "JobTable",
  loadJobsFromServer: function() {
    var self = this;
    d3.json(this.props.url, function(data) {
      data.sort();
      self.setState({jobs: data});
    });
  },
  getInitialState: function() {
    return {jobs: []};
  },
  componentDidMount: function() {
    this.loadJobsFromServer();
    setInterval(this.loadJobsFromServer, this.props.pollInterval);
  },
  render: function() {

    var cx = React.addons.classSet;
    var classes = cx({
      'table': true,
      'table-bordered': true,
      'table-hover': true,
      'tablesorter': true,
      'table-striped': true
    });

    var Jobs = this.state.jobs.map(function (job) {
      return (
        React.createElement(Job, {job: job})
      )
    });

    return (
    React.createElement("table", {className: classes}, 
      React.createElement("thead", null, 
      React.createElement("tr", null, React.createElement("td", null, "Ticket Number"), React.createElement("td", null, "Status"), React.createElement("td", null, "Kind"), React.createElement("td", null, "Sequences"), React.createElement("td", null, "Sites"), React.createElement("td", null, "Running Time"), React.createElement("td", null, "Creation Time"), React.createElement("td", null, "Queue Time"))
      ), 
      React.createElement("tbody", null, 
        Jobs
      )
    )
    );
  }
});

React.render(
  React.createElement(JobTable, {url: "/jobqueue/json", pollInterval: 2000}),
  document.getElementById('table')
);


