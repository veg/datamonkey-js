var React = require("react");
var ReactDOM = require("react-dom");
var ReactMarkdown = require("react-markdown");

function Table(props) {
  // A simple table component used to render the job status output.
  return <table className="table table-striped">{props.children}</table>;
}

function render_stdOut(element, stdOut) {
  ReactDOM.render(
    <div
      style={{
        borderStyle: "solid",
        paddingLeft: "20px",
        paddingRight: "20px",
        marginRight: "0px",
        marginLeft: "0px",
        height: "500px",
        width: "100%",
        overflow: "scroll"
      }}
    >
      <ReactMarkdown source={stdOut} renders={{ table: Table }} />
    </div>,
    document.getElementById(element)
  );
}

module.exports = render_stdOut;
