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

class BGMForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      datatype: "3",
      showAdvanced: false,
      length_of_each_chain: 100000,
      number_of_burn_in_samples: 10000,
      number_of_samples: 100,
      message: null
    };
  }
  toggleShow() {
    var self = this;
    var showAdvanced = !self.state.showAdvanced;
    self.setState({
      showAdvanced: showAdvanced
    });
  }
  onDatatypeChange(event) {
    this.setState({
      datatype: event.target.value
    });
  }
  onLengthChange(event) {
    var value = event.target.value;
    if (value < 10000) {
      this.setState({
        message: "Please enter a length that is at least 10000."
      });
    } else if (value > 1000000000) {
      this.setState({
        message: "Please enter a length that is no more than 1000000000."
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
    if (value < 1) {
      this.setState({
        message:
          "Please enter an amount of samples to be drawn that is more than 1."
      });
    } else if (value > 100) {
      this.setState({
        message: "Please enter an amount of samples that is less than 100."
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
    const datatype = +$("select[name='datatype']").val();
    const gencodeid =
      datatype == 2
        ? -2
        : datatype == 1
        ? -1
        : $("select[name='gencodeid']").val();

    formData.append("files", file);
    formData.append("datatype", datatype);
    formData.append(
      "substitution_model",
      $("select[name='substitution_model']").val() || 0
    );
    formData.append("gencodeid", gencodeid);
    formData.append(
      "receive_mail",
      $("input[name='receive_mail']").prop("checked")
    );
    formData.append("mail", $("input[name='mail']").val());
    formData.append("length_of_each_chain", $("#length_of_each_chain").val());
    formData.append(
      "number_of_burn_in_samples",
      $("#number_of_burn_in_samples").val()
    );
    formData.append("number_of_samples", $("#number_of_samples").val());
    formData.append(
      "maximum_parents_per_node",
      $("#maximum_parents_per_node").val()
    );
    formData.append("minimum_subs_per_site", $("#minimum_subs_per_site").val());

    var xhr = new XMLHttpRequest();

    xhr.open("post", "/bgm", true);

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
          <label className="font-weight-bold mr-1 mb-2" id="datatype-content">
            Multiple Sequence Alignment
          </label>

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

        <div>
          <label className="font-weight-bold mr-1 mb-2" id="datatype-content">
            Data type
          </label>
          <select
            name="datatype"
            value={this.state.datatype}
            onChange={e => this.onDatatypeChange(e)}
          >
            <option value="1">Nucleotide</option>
            <option value="2">Amino acid</option>
            <option value="3">Codon</option>
          </select>
        </div>

        {this.state.datatype == "2" ? (
          <div className="upload-div">
            <label id="substitution_model">Substitution Model</label>
            <select name="substitution_model">
              <option value="1">
                LG (Generalist empirical model from Le and Gascuel 2008)
              </option>
              <option value="2">
                WAG (Generalist empirical model from Whelon and Goldman 2001)
              </option>
              <option value="3">
                JTT (Generalist empirical model from Jones, Taylor and Thornton
                1996)
              </option>
              ption value="4"> JC69 (Generalist empirical model with equal
              exhangeability rates among all amino acids) option>
              <option value="5">
                mtMet (Specialist empirical model for metazoan mitochondrial
                genomes from Le, Dang and Le 2007)
              </option>
              <option value="6">
                mtVer (Specialist empirical model for vertebrate mitochondrial
                gemones from Le, Dang and Le 2007)
              </option>
              ption value="7"> mtInv (Specialist empirical model for
              invertebrate mitochondrial genomes from Le, Dang and Le 2007)
              option>
              <option value="8">
                gcpREV (Specialist empirical model for green plant chloroplast
                genomes from Cox and Foster 20013)
              </option>
              <option value="9">
                HIVBm (Specialist empirical model for between-host HIV sequences
                from Nickle et al. 2007)
              </option>
              <option value="10">
                HIVWm (Specialist empirical model for within-host HIV sequences
                from Nickle et al. 2007)
              </option>
              <option value="11">
                GTR (General time reversible model; 189 estimated parameters)
              </option>
            </select>
          </div>
        ) : null}

        {this.state.datatype == "3" ? (
          <div className="upload-div">
            <label
              className="font-weight-bold mr-1 mb-2"
              id="geneticcode-content"
            >
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
        ) : null}

        <div className="form-group">
          <label className="font-weight-bold mr-1 mb-2">
            Notify When Completed?
          </label>
          <input
            name="mail"
            type="text"
            className="form-control"
            placeholder="Email Address"
          />
        </div>

        <button
          className="btn btn-outline-secondary"
          data-toggle="button"
          type="button"
          onClick={() => self.toggleShow()}
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
                <label>Length of each chain</label>
                <input
                  id="length_of_each_chain"
                  className="form-control"
                  type="number"
                  step="500000"
                  value={this.state.length_of_each_chain}
                  onChange={e => this.onLengthChange(e)}
                />
              </div>

              <div>
                <label>Use this many samples as burn-in</label>
                <input
                  id="number_of_burn_in_samples"
                  className="form-control"
                  type="number"
                  step="500000"
                  value={this.state.number_of_burn_in_samples}
                  onChange={e => this.onBurninChange(e)}
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
                  onChange={e => this.onSampleChange(e)}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div>
                <label>Maximum number of parents per node</label>
                <input
                  id="maximum_parents_per_node"
                  className="form-control"
                  type="number"
                  defaultValue="1"
                  step="1"
                  min="1"
                  max="3"
                />
              </div>

              <div>
                <label>Minimum number of substitutions per site</label>
                <input
                  id="minimum_subs_per_site"
                  className="form-control"
                  type="number"
                  defaultValue="1"
                  step="1"
                  min="1"
                  max="100000"
                />
              </div>
            </div>
          </div>
        </div>

        <ErrorMessage message={this.state.message} />

        <button
          type="submit"
          id="submit-button"
          className="run-analysis-button-text dm-continue-btn btn float-right"
          onClick={this.submit}
        >
          Run Analysis <span className="fa fa-play" />
        </button>
        <div style={{ paddingBottom: "30px" }} />
      </form>
    );
  }
}

function render_bgm_form() {
  ReactDOM.render(
    <BGMForm post_to={"bgm"} />,
    document.getElementById("upload-form")
  );
}

module.exports = render_bgm_form;
