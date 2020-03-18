var React = require("react");
var ReactDOM = require("react-dom");
var ReactMarkdown = require("react-markdown");

function Table(props) {
  // A simple table component used to render the job status output.
  return <table className="table table-striped">{props.children}</table>;
}

class LogFile extends React.Component {
  constructor(props) {
    super(props);
    this.state = { job_log: props.initialStdOut };
  }

  socketListeners() {
    // Status update
    this.props.socket.on("status update", data => {
      if (data) {
        this.setState({ job_log: data.msg });
      }
    });
  }

  componentDidMount() {
    this.socketListeners();
  }

  render() {
    return (
      <div
        style={{
          height: "500px",
          width: "100%",
          overflow: "scroll"
        }}
      >
        <ReactMarkdown source={this.state.job_log} renders={{ table: Table }} />
      </div>
    );
  }
}

function render_stdOut(element, stdOut, socket) {
  ReactDOM.render(
    <LogFile initialStdOut={stdOut} socket={socket} />,
    document.getElementById(element)
  );
}

module.exports = render_stdOut;
