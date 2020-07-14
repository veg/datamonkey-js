var React = require("react"),
  ReactDOM = require("react-dom");

var api_top_div = {
  fontFamily: "montserrat",
  fontSize: "1.286em",
  fontWeight: "700",
  color: "#009BA1",
  marginTop: "10%",
  marginBottom: "5%",
  marginLeft: "40%",
};

class ApiKeyLookup extends React.Component {
  state = {
    value: "",
  };

  handleInputChange = (e) => {
    this.setState({
      value: e.target.value,
    });
  };

  handleSearch = (e) => {
    e.preventDefault();
    if (this.state.value.length > 24 || this.state.value.length < 24) {
      alert("Incorrect length, API Key should have a length of 24");
    } else {
      const redirection = `/keysearch/${this.state.value}`;
      console.log("Value = " + redirection);
      window.location.href = redirection;
    }
  };

  render() {
    const { value } = this.state;
    return (
      <div style={api_top_div}>
        <form onSubmit={this.handleSearch}>
          <input
            className="search"
            placeholder="Enter API Key ⌕"
            type="text"
            value={value}
            onChange={this.handleInputChange}
          />
        </form>
      </div>
    );
  }
}

function render_api_lookup(element) {
  ReactDOM.render(<ApiKeyLookup />, document.getElementById(element));
}

module.exports.ApiKeyLookup = ApiKeyLookup;
module.exports = render_api_lookup;
