var React = require("react");
var ReactDOM = require("react-dom");

var DataFiles = require("./data_files.jsx");
var AnalyzingData = require("./analyzing_data.jsx");

class Help extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div
        className="container"
        data-spy="scroll"
        data-target="#dm-help-scrollspy"
        data-offset="0"
      >
        <div className="row">
          <div className="col">
            <h1>Help</h1>
            <p>Documentation for Datamonkey's Analyses</p>
            <p> For persistent errors or questions not answered here please open an issue on our 
              <a href="https://github.com/veg/hyphy/issues">
            Github
          </a>{" "}  </p>
            <div>{this.props.datamonkey ? null : null}</div>

            <br />

            <DataFiles />
            <AnalyzingData />
          </div>

          {/*
          /////Scrollspy Nav
          <div className="col-2 offset-md-1">
            <ul className="list-group position-fixed" id="dm-help-scrollspy">
              <li className="list-group-item list-group-item-action">Data Files</li>
                <ul>
                  <li className="list-group-item list-group-item-action"><a href="#data-files">List 2</a></li>
                  <li className="list-group-item list-group-item-action">List 3</li>
                </ul>
              <li className="list-group-item list-group-item-action">Analyzing Data</li>
                <ul>
                  <li className="list-group-item list-group-item-action"><a href="#analyzing-data">List 2</a></li>
                  <li className="list-group-item list-group-item-action"><a href="#data-files">List 2</a></li>
                </ul>
            </ul>
          </div>
          */}
        </div>
      </div>
    );
  }
}

function render_help(element, datamonkey) {
  ReactDOM.render(
    <Help datamonkey={datamonkey} />,
    document.getElementById(element)
  );
}

module.exports.Help = Help;
module.exports = render_help;
