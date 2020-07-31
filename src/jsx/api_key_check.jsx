var React = require("react"),
  Router = "react-router",
  url = require("url"),
  ReactDOM = require("react-dom");

var api_top_div = {
  fontFamily: "montserrat",
  fontSize: "1",
  fontWeight: "500",
  color: "#009BA1",
  marginTop: "5%",
  marginBottom: "5%",
};

var text_align = {
  //border: "1px solid #dddddd",
  textAlign: "left",
  //padding: "8px"
};

class ApiKeyCheck extends React.Component {
  constructor(props) {
    super(props),
      (this.state = {
        loaded: false,
        api_key: "",
        remaining: "",
        expires: "",
        created: "",
        jobs: [""],
      });
  }

  componentDidMount() {
    var api_key_id = url.parse(window.location.href).pathname.substr(11);

    this.setState({
      api_key: api_key_id,
    });

    fetch("http://dev.datamonkey.org/api/v1/keyinfo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: api_key_id }),
    })
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState({
            loaded: true,
            remaining: result.job_remaining,
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
        }
      );
  }

  render() {
    return (
      <center>
        <div className="dm-card-header card-header" style={api_top_div}>
          <center>
            <div className="api_top_div" style={api_top_div}>
              <h3>API Key Details</h3>
              <table
                id="table"
                className="table table-light table-bordered table-striped table-hover"
              >
                <tbody>
                  <tr>
                    <td
                      scope="row"
                      className="font-weight-bold"
                      style={text_align}
                    >
                      {" "}
                      Key ID{" "}
                    </td>
                    <td
                      id="api_key_id"
                      className="font-weight-normal"
                      style={text_align}
                    >
                      {" "}
                      {this.state.api_key}{" "}
                    </td>
                  </tr>
                  <tr>
                    <td
                      scope="row"
                      className="font-weight-bold"
                      style={text_align}
                    >
                      Remaining Jobs{" "}
                    </td>
                    <td
                      id="api_key_remainig"
                      className="font-weight-normal"
                      style={text_align}
                    >
                      {" "}
                      {this.state.remaining}{" "}
                    </td>
                  </tr>
                  <tr>
                    <td
                      scope="row"
                      className="font-weight-bold"
                      style={text_align}
                    >
                      {" "}
                      Created{" "}
                    </td>
                    <td
                      id="api_key_create"
                      className="font-weight-normal"
                      style={text_align}
                    >
                      {" "}
                      {this.state.created}{" "}
                    </td>
                  </tr>
                  <tr>
                    <td
                      scope="row"
                      className="font-weight-bold"
                      style={text_align}
                    >
                      {" "}
                      Expires{" "}
                    </td>
                    <td
                      id="api_key_expire"
                      className="font-weight-normal"
                      style={text_align}
                    >
                      {" "}
                      {this.state.expires}{" "}
                    </td>
                  </tr>
                  <tr>
                    <td
                      scope="row"
                      className="font-weight-bold"
                      style={text_align}
                    >
                      {" "}
                      Associated Jobs{" "}
                    </td>
                    <td
                      id="api_key_jobs"
                      className="text-justify font-weight-normal"
                      style={text_align}
                    >
                      {" "}
                      {this.state.jobs.map((job) => (
                        <li key={job}> {job} </li>
                      ))}{" "}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </center>
        </div>
      </center>
    );
  }
}

function render_api_check(element) {
  ReactDOM.render(<ApiKeyCheck />, document.getElementById(element));
}

module.exports.ApiKeyCheck = ApiKeyCheck;
module.exports = render_api_check;
