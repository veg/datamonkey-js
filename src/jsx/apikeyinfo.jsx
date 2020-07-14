var React = require("react"),
  ReactDOM = require("react-dom");

var api_top_div = {
  fontFamily: "montserrat",
  fontSize: "1",
  fontWeight: "500",
  color: "#009BA1",
  marginTop: "5%",
  marginBottom: "5%",
  marginLeft: "28%",
};

class ApiKeyCheck extends React.Component {
  constructor(props) {
    super(props),
      (this.state = {
        loaded: false,
        api_key: "", //Should come from URL
        remaining: "",
        expires: "",
        created: "",
        jobs: [""],
      });
  }

  componentDidMount() {
    var api_key_id = "5f0c81601a544049b62f1147";
    this.setState({
      api_key: api_key_id,
    });

    fetch("http://dev.datamonkey.org/keyinfo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: api_key_id }),
    })
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState({
            loaded: true,
            remaining: result.job_request_made,
            expires: result.expires,
            created: result.created,
            jobs: result.associated_job_ids,
          });
        },
        (error) => {
          this.setState({
            loaded: true,
            error,
          });
          console.log("error = ", error);
        }
      );
  }

  render() {
    return (
      <div className="api_top_div" style={api_top_div}>
        <h1>API Key information</h1>
        <div className="col">
          <table id="single_Table">
            <tbody>
              <tr>
                <td> ID </td>
                <td id="api_key_id"> {this.state.api_key} </td>
              </tr>
              <tr>
                <td> Jobs remaining </td>
                <td id="api_key_remainig"> {this.state.remaining} </td>
              </tr>
              <tr>
                <td> Created </td>
                <td id="api_key_create"> {this.state.created} </td>
              </tr>
              <tr>
                <td> Expires </td>
                <td id="api_key_expire"> {this.state.expires} </td>
              </tr>
              <tr>
                <td> Associated Jobs </td>
                <td id="api_key_jobs">
                  {" "}
                  {this.state.jobs.map((job) => (
                    <li key={job}> {job} </li>
                  ))}{" "}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

function render_api_check(element) {
  ReactDOM.render(<ApiKeyCheck />, document.getElementById(element));
}

module.exports.ApiKeyCheck = ApiKeyCheck;
module.exports = render_api_check;
