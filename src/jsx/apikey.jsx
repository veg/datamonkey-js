var React = require("react"),
  ReactDOM = require("react-dom"),
  Recaptcha = require("react-recaptcha");

// const request     = require("request"),
//     api         = require("../../app/routes/api.js");

var api_top_div = {
  fontFamily: "montserrat",
  fontSize: "1.286em",
  fontWeight: "700",
  color: "#009BA1",
  marginTop: "5%",
  marginBottom: "1%",
  textAlign: "center",
};

var api_cap_div = {
  marginLeft: "30%",
  marginRight: "30%",
  marginBottom: "5%",
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
      //isVerified: false,
      isVerified: false,
    };
  }

  componentDidMount() {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.google.com/recaptcha/api.js";
    this.div.appendChild(script);
  }

  recaptchaLoaded() {
    console.log("Capcha successfully loaded");
  }

  handleSubscribe() {
    if (this.state.isVerified) {
      fetch("http://dev.datamonkey.org/api/v1/issueKey")
        .then((response) => {
          return response.json();
        })
        .then((api) => {
          this.setState({
            isLoaded: true,
            posts: api,
          });
          alert("New API key = " + api);
        });

      //Prevent button spam and set back to false
      this.state = {
        isVerified: false,
      };
      grecaptcha.reset();
    } else {
      alert("Please verify that you are human before continuing");
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

        <div style={api_cap_div} ref={(el) => (this.div = el)}>
          <Recaptcha
            sitekey="6LclsawZAAAAAE8UAQK08flCbFFRcLQ_wZwU0DIn"
            render="explicit"
            onloadCallback={this.recaptchaLoaded}
            verifyCallback={this.verifyCallback}
          />
        </div>
      </div>
    );
  }
}

function render_api(element) {
  ReactDOM.render(<ApiKey />, document.getElementById(element));
}

module.exports.ApiKey = ApiKey;
module.exports = render_api;
