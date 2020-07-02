var React = require("react"),
  ReactDOM = require("react-dom"),
  Recaptcha = require("react-recaptcha");

var api_top_div = {
  fontFamily: "montserrat",
  fontSize: "1.286em",
  fontWeight: "700",
  color: "#009BA1",
  marginTop: "5%",
  marginBottom: "5%",
  textAlign: "center",
};

var api_button = {
  border: "outset",
  marginLeft: "30%",
  marginRight: "30%",
  borderRightColor: "#009BA1",
};

class ApiKey extends React.Component {
  constructor(props) {
    super(props);

    this.handleSubscribe = this.handleSubscribe.bind(this);
    this.recaptchaLoaded = this.recaptchaLoaded.bind(this);
    this.verifyCallback = this.verifyCallback.bind(this);

    this.state = {
      isVerified: false,
    };
  }

  recaptchaLoaded() {
    console.log("Capcha successfully loaded");
  }

  handleSubscribe() {
    if (this.state.isVerified) {
      alert("You have successfully subscribed!");
    } else {
      alert("Please verify that you are a human!");
    }
  }

  verifyCallback(response) {
    if (response) {
      this.setState({
        isVerified: true,
      });
    }
  }

  render() {
    return (
      <div className="api_top_div" style={api_top_div}>
        <div
          style={api_button}
          className="api_button"
          onClick={this.handleSubscribe}
        >
          Get API Key
        </div>
        <Recaptcha
          sitekey="6LclsawZAAAAAE8UAQK08flCbFFRcLQ_wZwU0DIn"
          render="explicit"
          onloadCallback={this.recaptchaLoaded}
          verifyCallback={this.verifyCallback}
        />
      </div>
    );
  }
}

function render_api(element) {
  ReactDOM.render(<ApiKey />, document.getElementById(element));
}

module.exports.ApiKey = ApiKey;
module.exports = render_api;
