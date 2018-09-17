var React = require("react"),
  ReactDOM = require("react-dom");

function ErrorMessage(props) {
  if (!props.message) return <div />;
  return (
    <div className="alert alert-danger" role="alert">
      <span
        className="glyphicon glyphicon-exclamation-sign"
        aria-hidden="true"
      />
      <span className="sr-only">Error:</span>
      {props.message}
    </div>
  );
}

class FUBARForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAdvanced: false,
      length_of_each_chain: 2000000,
      number_of_burn_in_samples: 1000000,
      number_of_samples: 100,
      message: null
    };
    this.toggleShow = this.toggleShow.bind(this);
    this.onLengthChange = this.onLengthChange.bind(this);
    this.onBurninChange = this.onBurninChange.bind(this);
    this.onSampleChange = this.onSampleChange.bind(this);
  }
  onMailChange() {
    //datamonkey.helpers.validate_email(elem);
  }
  toggleShow() {
    var self = this;
    var showAdvanced = !self.state.showAdvanced;
    self.setState({
      showAdvanced: showAdvanced
    });
  }
  onLengthChange(event) {
    var value = event.target.value;
    if (value < 500000) {
      this.setState({
        message: "Please enter a length that is at least 500000."
      });
    } else if (value > 50000000) {
      this.setState({
        message: "Please enter a length that is no more than 50000000."
      });
    } else {
      this.setState({
        length_of_each_chain: value,
        message: null
      });
    }
  }
  onBurninChange(event) {
    var value = event.target.value,
      length = this.state.length_of_each_chain;
    if (value < Math.ceil(0.05 * length)) {
      this.setState({
        message:
          "Please enter a burn in that is at least 5% of the chain length."
      });
    } else if (value > Math.ceil(0.95 * length)) {
      this.setState({
        message:
          "Please enter a burn in that is no more than 95% of the chain length."
      });
    } else {
      this.setState({
        number_of_burn_in_samples: value,
        message: null
      });
    }
  }
  onSampleChange(event) {
    var value = event.target.value;
    if (value < 50) {
      this.setState({
        message:
          "Please enter an amount of samples to be drawn that is more than 50."
      });
    } else if (
      value >
      this.state.length_of_each_chain - this.state.number_of_burn_in_samples
    ) {
      this.setState({
        message:
          "Please enter an amount of samples that is no more than the chain length minus the amount of burn in."
      });
    } else {
      this.setState({
        number_of_samples: value,
        message: null
      });
    }
  }
  submit(e) {
    e.preventDefault();

    $("#file-progress").removeClass("hidden");

    var formData = new FormData();
    var file = document.getElementById("seq-file").files[0];

    formData.append("files", file);
    formData.append("datatype", $("select[name='datatype']").val());
    formData.append("gencodeid", $("select[name='gencodeid']").val());
    formData.append(
      "receive_mail",
      $("input[name='receive_mail']").prop("checked")
    );
    formData.append("mail", $("input[name='mail']").val());
    formData.append("number_of_grid_points", $("#number_of_grid_points").val());
    formData.append("number_of_mcmc_chains", $("#number_of_mcmc_chains").val());
    formData.append("length_of_each_chain", $("#length_of_each_chain").val());
    formData.append(
      "number_of_burn_in_samples",
      $("#number_of_burn_in_samples").val()
    );
    formData.append("number_of_samples", $("#number_of_samples").val());
    formData.append(
      "concentration_of_dirichlet_prior",
      $("#concentration_of_dirichlet_prior").val()
    );

    var xhr = new XMLHttpRequest();

    xhr.open("post", "/fubar", true);

    xhr.upload.onprogress = function(e) {
      if (e.lengthComputable) {
        var percentage = (e.loaded / e.total) * 100;
        $("#file-progress").css("display", "block");
        $("#seq-file").css("display", "none");
        $(".progress .progress-bar").css("width", percentage + "%");
      }
    };

    xhr.onerror = function(e) {
      $("#file-progress").html(e);
    };

    xhr.onload = function(res) {
      // Replace field with green text, name of file
      var result = JSON.parse(this.responseText);

      if (_.has(result, "error")) {
        $("#modal-error-msg").text(result.error);
        $("#errorModal").modal();
        $("#file-progress").css("display", "none");
        $("#seq-file").css("display", "block");
        $(".progress .progress-bar").css("width", "0%");
      } else if ("error" in result.analysis) {
        $("#modal-error-msg").text(result.error);
        $("#errorModal").modal();
        $("#file-progress").css("display", "none");
        $("#seq-file").css("display", "block");
        $(".progress .progress-bar").css("width", "0%");
      } else if ("upload_redirect_path" in result) {
        window.location.href = result.upload_redirect_path;
      } else {
        $("#modal-error-msg").text(
          "We received data in an unexpected format from the server."
        );
        $("#errorModal").modal();
        $("#file-progress").css("display", "none");
        $("#seq-file").css("display", "block");
        $(".progress .progress-bar").css("width", "0%");
      }
    };

    xhr.send(formData);
  }

  render() {
    var self = this;
    return (
      <form
        id="msa-form"
        className="form-horizontal upload-form"
        name="uploadform"
        enctype="multipart/form-data"
        method="post"
        action={this.props.post_to}
      >
        <div id="seq-file-div" className="upload-div">
          <input id="seq-file" type="file" name="files" />
          <div
            id="file-progress"
            className="progress progress-striped active hidden"
          >
            <div
              className="progress-bar"
              role="progressbar"
              aria-valuenow="0"
              aria-valuemin="1"
              aria-valuemax="100"
            >
              <span className="sr-only">0% Complete</span>
            </div>
          </div>
        </div>

        <div className="upload-div">
          <label id="geneticcode-content">
            Genetic code
            <a href="/help#genetic-code" target="_blank">
              <sup>?</sup>
            </a>
          </label>
          <select name="gencodeid">
            <option value="0">Universal code</option>

            <option value="1">Vertebrate mitochondrial DNA code</option>

            <option value="2">Yeast mitochondrial DNA code</option>

            <option value="3">
              Mold, Protozoan and Coelenterate mt; Mycloplasma/Spiroplasma
            </option>

            <option value="4">Invertebrate mitochondrial DNA code</option>

            <option value="5">
              Ciliate, Dasycladacean and Hexamita Nuclear code
            </option>

            <option value="6">Echinoderm mitochondrial DNA code</option>

            <option value="7">Euplotid Nuclear code</option>

            <option value="8">Alternative Yeast Nuclear code</option>

            <option value="9">Ascidian mitochondrial DNA code</option>

            <option value="10">Flatworm mitochondrial DNA code</option>

            <option value="11">Blepharisma Nuclear code</option>
          </select>
        </div>

        <div className="form-group">
          <label id="datatype-content" className="col-lg-3 control-label">
            Notify When Completed?
          </label>
          <div className="col-lg-9 input-group mail-group">
            <span className="input-group-addon">
              <input name="receive_mail" type="checkbox" defaultValue="on" />
            </span>
            <input
              name="mail"
              type="text"
              className="form-control"
              placeholder="Email Address"
            />
          </div>
        </div>

        <button
          className="btn"
          type="button"
          onClick={self.toggleShow}
          style={{ display: "block", verticalAlign: "middle" }}
        >
          Advanced options{" "}
          <span
            style={{ verticalAlign: "middle" }}
            className={
              "glyphicon glyphicon-menu-" +
              (this.state.showAdvanced ? "down" : "right")
            }
            aria-hidden="true"
          />
        </button>

        <div style={{ display: self.state.showAdvanced ? "block" : "none" }}>
          <div className="row">
            <div className="col-md-6">
              <div>
                <label>Number of grid points</label>
                <input
                  id="number_of_grid_points"
                  className="form-control"
                  type="number"
                  defaultValue="20"
                  step="1"
                  min="5"
                  max="50"
                />
              </div>

              <div>
                <label>Number of MCMC chains</label>
                <input
                  id="number_of_mcmc_chains"
                  className="form-control"
                  type="number"
                  defaultValue="5"
                  step="1"
                  min="2"
                  max="20"
                />
              </div>

              <div>
                <label>Length of each chain</label>
                <input
                  id="length_of_each_chain"
                  className="form-control"
                  type="number"
                  step="500000"
                  value={this.state.length_of_each_chain}
                  onChange={this.onLengthChange}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div>
                <label>Use this many samples as burn-in</label>
                <input
                  id="number_of_burn_in_samples"
                  className="form-control"
                  type="number"
                  step="500000"
                  value={this.state.number_of_burn_in_samples}
                  onChange={this.onBurninChange}
                />
              </div>

              <div>
                <label>How many samples should be drawn from each chain?</label>
                <input
                  id="number_of_samples"
                  className="form-control"
                  type="number"
                  step="10"
                  value={this.state.number_of_samples}
                  onChange={this.onSampleChange}
                />
              </div>

              <div>
                <label>Concentration parameter of the Dirichlet prior</label>
                <input
                  id="concentration_of_dirichlet_prior"
                  className="form-control"
                  type="number"
                  defaultValue=".5"
                  step="1"
                  min="0.001"
                  max="1"
                />
              </div>
            </div>
          </div>
        </div>

        <ErrorMessage message={this.state.message} />

        <button
          type="submit"
          className="run-analysis-button-text continue-btn btn"
          onClick={this.submit}
        >
          Run Analysis
          <span className="dm-continue-btn fas fa-play" />
        </button>

        <div style={{ paddingBottom: "30px" }} />
      </form>
    );
  }
}

function render_fubar_form() {
  ReactDOM.render(
    <FUBARForm post_to={"fubar"} />,
    document.getElementById("upload-form")
  );
}

module.exports = render_fubar_form;
