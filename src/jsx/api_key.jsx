var React = require("react"),
  ReactDOM = require("react-dom"),
  Recaptcha = require("react-recaptcha");

var api_top_div = {
  fontFamily: "montserrat",
  fontSize: "1.286em",
  fontWeight: "700",
  color: "#00A99D", //#00A99D
  marginTop: "3%",
  marginBottom: "1%",
};

var api_cap_div = {
  marginLeft: "0%",
  marginRight: "0%",
  marginBottom: "5%",
};

var api_button = {
  border: "3px outset",
  marginTop: "2%",
  marginBottom: "0.5%",
  height: "40px",
  width: "304px",
  border_radius: "4px",
  backgroundColor: "#F9F9F9",
  textAlign: "center",
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
      fetch("/api/v1/issueKey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cap: grecaptcha.getResponse() }),
      })
        .then((response) => {
          return response.json();
        })
        .then((api) => {
          this.setState({
            isLoaded: true,
            posts: api,
          });
          const redirection = `/keysearch/${api.replace(/["]+/g, "")}`;
          window.location.href = redirection;
          //Prevent button spam and set back to false
          this.state = {
            isVerified: false,
          };
          grecaptcha.reset();
        });
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
      <center>
        <div className="dm-card-header card-header" style={api_top_div}>
          <center>
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
                  sitekey={this.props.publicKey}
                  render="explicit"
                  onloadCallback={this.recaptchaLoaded}
                  verifyCallback={this.verifyCallback}
                />
              </div>
            </div>
          </center>
        </div>
      </center>
    );
  }
}

function render_api(element) {
  let publicKey = document.getElementById("api-container").dataset["captcha"];
  ReactDOM.render(
    <ApiKey publicKey={publicKey} />,
    document.getElementById(element)
  );
}

module.exports.ApiKey = ApiKey;
module.exports = render_api;
