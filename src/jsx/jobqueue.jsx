var React = require("react"),
  ReactDOM = require("react-dom"),
  moment = require("moment");

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

var Job = React.createClass({
  mixins: [SetIntervalMixin],
  getInitialState: function() {
    return { seconds: 0 };
  },
  componentDidMount: function() {
    this.setInterval(this.tick, 1000); // Call a method on the mixin
  },
  tick: function() {
    this.setState({
      running_time: this.timeDiff(this.props.job.start_time),
      queue_time: this.getQueueTime()
    });
  },
  timeDiff: function(start_time) {
    if (start_time) {
      var zero = d3.format("02d"),
        hours = moment().diff(start_time, "hours"),
        mins = moment().diff(start_time, "minutes") % 60,
        secs = moment().diff(start_time, "seconds") % 60,
        diff = zero(hours) + ":" + zero(mins) + ":" + zero(secs);
    } else {
      diff = "-";
    }
    return diff;
  },
  getQueueTime() {
    var qtime = "-";
    if (this.props.job.creation_time && !this.props.job.start_time) {
      qtime = this.timeDiff(this.props.job.creation_time);
    }
    return qtime;
  },
  render: function() {
    this.props.job.formatted_time = moment(this.props.job.creation_time).format(
      "lll"
    );
    return (
      <tr>
        <td>{this.props.job.id}</td>
        <td>{this.props.job.status}</td>
        <td>{this.props.job.type}</td>
        <td>{this.props.job.sequences}</td>
        <td>{this.props.job.sites}</td>
        <td>{this.state.running_time}</td>
        <td>{this.props.job.formatted_time}</td>
        <td>{this.state.queue_time}</td>
      </tr>
    );
  }
});

var JobTable = React.createClass({
  loadJobsFromServer: function() {
    var self = this;
    d3.json(this.props.url, function(data) {
      data = _.sortBy(data, "creation_time");
      self.setState({ jobs: data });
    });
  },
  getInitialState: function() {
    return { jobs: [] };
  },
  componentDidMount: function() {
    this.loadJobsFromServer();
    setInterval(this.loadJobsFromServer, this.props.pollInterval);
  },
  render: function() {
    var Jobs = this.state.jobs.map(function(job) {
      return <Job job={job} />;
    });

    return (
      <table className="table table-bordered table-hover tablesorter table-striped">
        <thead>
          <tr>
            <th>Ticket Number</th>
            <th>Status</th>
            <th>Kind</th>
            <th>Sequences</th>
            <th>Sites</th>
            <th>Running Time</th>
            <th>Creation Time</th>
            <th>Queue Time</th>
          </tr>
        </thead>
        <tbody>{Jobs}</tbody>
      </table>
    );
  }
});

function render_jobqueue() {
  ReactDOM.render(
    <JobTable url="/jobqueue/json" pollInterval={2000} />,
    document.getElementById("table")
  );
}

module.exports = render_jobqueue;
