var React = require("react");
var ReactDOM = require("react-dom");
var ReactMarkdown = require("react-markdown");

function Table(props) {
  // A simple table component used to render the job status output.
  return <table className="table table-striped">{props.children}</table>;
}

function render_stdOut(element, stdOut) {
  ReactDOM.render(
    <ReactMarkdown source={stdOut} renders={{ table: Table }} />,
    document.getElementById(element)
  );
}

module.exports = render_stdOut;
