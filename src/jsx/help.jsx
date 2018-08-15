var React = require("react");
var ReactDOM = require("react-dom");

var DataFiles = require("./data_files.jsx");
var AnalyzingData = require("./analyzing_data.jsx");

/*
import DataFiles from "./data_files.jsx";
import AnalyzingData from "./analyzing_data.jsx";
*/

class Help extends React.Component {
  constructor(props) {
    super(props);
  }

  exampleData() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 id="example-files" className="panel-title">
            Example Files
          </h3>
        </div>
        <a href="/assets/Flu.fasta" role="button" className="btn btn-primary">
          Influenza A H5N1 hemagluttinin
        </a>
        <a href="/assets/pol.nex" role="button" className="btn btn-primary">
          HIV-1 pol (recombinant data)
        </a>
      </div>
    );
  }

  render() {
    return (
      <div id="help-container" className="container">
        <div className="row">
          <div className="col-md-10 col-md-offset-1">
            <h1>Help</h1>
            <p>Documentation for Datamonkey's Analyses</p>
            <br />

            <div className="help-content tab-content col-md-9">
              {/* TODO: insert datalinks */}
              <div>{this.props.datamonkey ? null : null}</div>
              <br />

              <DataFiles />
              <AnalyzingData />
            </div>

            <nav id="sidebar" className="col-md-2 bs-docs-sidebar pull-right">
              <ul className="nav nav-stacked fixed">
                <li>
                  <a href="#data-files">
                    <strong>Data Files</strong>
                  </a>
                  <ul className="nav nav-stacked">
                    <li>
                      <a href="#genetic-codes">Genetic Codes</a>
                    </li>
                    <li>
                      <a href="#data-formats">Data Formats</a>
                    </li>
                  </ul>
                </li>
                <li>
                  <a href="#analyzing-data">
                    <strong>Analyzing Data</strong>
                  </a>
                  <ul className="nav nav-stacked">
                    <li>
                      <a href="#ambiguities">Ambiguities</a>
                    </li>
                    <li>
                      <a href="#significance-levels">Significance Levels</a>
                    </li>
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
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

//module.exports.Help = Help;
module.exports = render_help;
