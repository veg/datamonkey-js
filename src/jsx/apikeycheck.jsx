var React = require("react"),
  ReactDOM = require("react-dom");

var api_top_div = {
  fontFamily: "montserrat",
  fontSize: "1.286em",
  fontWeight: "700",
  color: "#009BA1",
  marginTop: "20%",
  marginBottom: "20%",
  marginLeft: "40%",
};

class ApiKeyCheck extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="api_top_div" style={api_top_div}>
        <h1>Under Construction</h1>
      </div>
    );
  }
}

function render_api_check(element) {
  ReactDOM.render(<ApiKeyCheck />, document.getElementById(element));
}

module.exports.ApiKeyCheck = ApiKeyCheck;
module.exports = render_api_check;
