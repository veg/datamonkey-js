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

class DifFUBARForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAdvanced: false,
      grid_points: 20,
      concentration: 0.5,
      mcmc_iterations: 2500,
      burnin_samples: 500,
      pos_threshold: 0.95,
      message: null
    };

    this.toggleShow = this.toggleShow.bind(this);
    this.onGridPointChange = this.onGridPointChange.bind(this);
    this.onConcentrationChange = this.onConcentrationChange.bind(this);
    this.onMCMCIterationsChange = this.onMCMCIterationsChange.bind(this);
    this.onBurninSamplesChange = this.onBurninSamplesChange.bind(this);
    this.onPosThresholdChange = this.onPosThresholdChange.bind(this);
  }

  toggleShow() {
    var self = this;
    var showAdvanced = !self.state.showAdvanced;
    self.setState({
      showAdvanced: showAdvanced
    });
  }

  onGridPointChange(event) {
    var value = event.target.value;
    if (value < 5) {
      this.setState({
        message: "Please enter an amount of grid points that is more than 5."
      });
    } else if (value > 50) {
      this.setState({
        message: "Please enter an amount of grid points that is less than 50."
      });
    } else {
      this.setState({
        grid_points: value,
        message: null
      });
    }
  }

  onConcentrationChange(event) {
    var value = event.target.value;
    if (value < 0.001) {
      this.setState({
        message: "Please enter a concentration that is more than .001."
      });
    } else if (value > 1) {
      this.setState({
        message: "Please enter a concentration that is less than 1."
      });
    } else {
      this.setState({
        concentration: value,
        message: null
      });
    }
  }

  onMCMCIterationsChange(event) {
    var value = event.target.value;
    if (value < 100) {
      this.setState({
        message: "Please enter MCMC iterations that is more than 100."
      });
    } else if (value > 10000) {
      this.setState({
        message: "Please enter MCMC iterations that is less than 10000."
      });
    } else {
      this.setState({
        mcmc_iterations: value,
        message: null
      });
    }
  }

  onBurninSamplesChange(event) {
    var value = event.target.value;
    if (value < 50) {
      this.setState({
        message: "Please enter burnin samples that is more than 50."
      });
    } else if (value > 5000) {
      this.setState({
        message: "Please enter burnin samples that is less than 5000."
      });
    } else {
      this.setState({
        burnin_samples: value,
        message: null
      });
    }
  }

  onPosThresholdChange(event) {
    var value = event.target.value;
    if (value < 0.5) {
      this.setState({
        message: "Please enter a positive threshold that is more than 0.5."
      });
    } else if (value > 0.99) {
      this.setState({
        message: "Please enter a positive threshold that is less than 0.99."
      });
    } else {
      this.setState({
        pos_threshold: value,
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
    formData.append("receive_mail", $("input[name='mail']").val().length > 0);
    formData.append("mail", $("input[name='mail']").val());
    formData.append("number_of_grid_points", $("#number_of_grid_points").val());
    formData.append("concentration_of_dirichlet_prior", $("#concentration_of_dirichlet_prior").val());
    formData.append("mcmc_iterations", $("#mcmc_iterations").val());
    formData.append("burnin_samples", $("#burnin_samples").val());
    formData.append("pos_threshold", $("#pos_threshold").val());

    var xhr = new XMLHttpRequest();

    xhr.upload.addEventListener(
      "progress",
      function(evt) {
        if (evt.lengthComputable) {
          var percentComplete = evt.loaded / evt.total;
          percentComplete = parseInt(percentComplete * 100);
          $("#seq-file").html(
            "<div class='progress-bar' role='progressbar' aria-valuenow='" +
              percentComplete +
              "' aria-valuemin='0' aria-valuemax='100' style='width: " +
              percentComplete +
              "%;'>" +
              percentComplete +
              "%</div>"
          );

          if (percentComplete === 100) {
            $("#file-progress").html(
              '<div class="text-center"><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i> <br/> Job being queued...</div>'
            );
          }
        }
      },
      false
    );

    xhr.addEventListener("load", function(evt) {
      var response = JSON.parse(evt.target.responseText);
      if (response.error) {
        $("#modal-error-msg").text(response.error);
        $("#errorModal").modal();
        $("#file-progress").addClass("hidden");
      } else {
        window.location.href = response.upload_redirect_path;
      }
    });

    xhr.addEventListener("error", function(evt) {
      $("#modal-error-msg").text(evt.target.responseText);
      $("#errorModal").modal();
      $("#file-progress").addClass("hidden");
    });

    xhr.open("POST", "/difFubar");
    xhr.send(formData);
  }

  render() {
    var self = this;
    return (
      <div className="row">
        <div className="col-md-6">
          <form onSubmit={this.submit.bind(this)}>
            <div className="form-group">
              <label htmlFor="seq-file">Sequence file</label>
              <input
                type="file"
                className="form-control"
                id="seq-file"
                name="files"
                required
              />
              <small className="form-text text-muted">
                Please select a NEXUS file containing a multiple sequence
                alignment with an embedded phylogenetic tree.{" "}
                <a href="/assets/CD2-difFUBAR.nex" download="CD2-difFUBAR.nex">
                  Download example file
                </a>
              </small>
            </div>

            <div className="row">
              <div className="col-lg-6">
                <div className="form-group">
                  <label htmlFor="datatype">Data type</label>
                  <select
                    className="form-control"
                    name="datatype"
                    id="datatype"
                    defaultValue="0"
                  >
                    <option value="0">Codon data</option>
                  </select>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group">
                  <label htmlFor="gencode">Genetic Code</label>
                  <select
                    className="form-control"
                    name="gencodeid"
                    id="gencode"
                    defaultValue="0"
                  >
                    <option value="0">Universal</option>
                    <option value="1">Vertebrate mitochondrial</option>
                    <option value="2">Yeast mitochondrial</option>
                    <option value="3">Mold, Protozoan, and CoelenterateMitochondrial and Mycoplasma/Spiroplasma</option>
                    <option value="4">Invertebrate mitochondrial</option>
                    <option value="5">Ciliate, Dasycladacean and Hexamita nuclear</option>
                    <option value="8">Alternative yeast nuclear</option>
                    <option value="9">Ascidian mitochondrial</option>
                    <option value="10">Alternative flatworm mitochondrial</option>
                    <option value="11">Blepharisma nuclear</option>
                    <option value="12">Chlorophycean mitochondrial</option>
                    <option value="13">Trematode mitochondrial</option>
                    <option value="14">Scenedesmus obliquus mitochondrial</option>
                    <option value="15">Thraustochytrium mitochondrial</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="mail">Email address (optional)</label>
              <input
                type="email"
                className="form-control"
                id="mail"
                name="mail"
              />
              <small className="form-text text-muted">
                Enter your email to receive notification upon job completion
              </small>
            </div>

            <div className="form-group">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={this.toggleShow}
              >
                Advanced Options
              </button>
            </div>

            {this.state.showAdvanced && (
              <div>
                <div className="form-group">
                  <label htmlFor="number_of_grid_points">Grid points</label>
                  <input
                    type="number"
                    className="form-control"
                    id="number_of_grid_points"
                    name="number_of_grid_points"
                    value={this.state.grid_points}
                    onChange={this.onGridPointChange}
                    min="5"
                    max="50"
                  />
                  <small className="form-text text-muted">
                    Number of grid points for the omega values (5-50)
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="concentration_of_dirichlet_prior">
                    Concentration of Dirichlet prior
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="concentration_of_dirichlet_prior"
                    name="concentration_of_dirichlet_prior"
                    value={this.state.concentration}
                    onChange={this.onConcentrationChange}
                    min="0.001"
                    max="1"
                    step="0.001"
                  />
                  <small className="form-text text-muted">
                    Concentration parameter for the Dirichlet prior (0.001-1)
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="mcmc_iterations">MCMC iterations</label>
                  <input
                    type="number"
                    className="form-control"
                    id="mcmc_iterations"
                    name="mcmc_iterations"
                    value={this.state.mcmc_iterations}
                    onChange={this.onMCMCIterationsChange}
                    min="100"
                    max="10000"
                  />
                  <small className="form-text text-muted">
                    Number of MCMC iterations (100-10000)
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="burnin_samples">Burnin samples</label>
                  <input
                    type="number"
                    className="form-control"
                    id="burnin_samples"
                    name="burnin_samples"
                    value={this.state.burnin_samples}
                    onChange={this.onBurninSamplesChange}
                    min="50"
                    max="5000"
                  />
                  <small className="form-text text-muted">
                    Number of burnin samples (50-5000)
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="pos_threshold">Positive selection threshold</label>
                  <input
                    type="number"
                    className="form-control"
                    id="pos_threshold"
                    name="pos_threshold"
                    value={this.state.pos_threshold}
                    onChange={this.onPosThresholdChange}
                    min="0.5"
                    max="0.99"
                    step="0.01"
                  />
                  <small className="form-text text-muted">
                    Threshold for positive selection detection (0.5-0.99)
                  </small>
                </div>
              </div>
            )}

            <ErrorMessage message={this.state.message} />

            <div className="form-group">
              <button type="submit" className="btn btn-primary">
                Submit Analysis
              </button>
            </div>
          </form>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <strong>difFUBAR</strong>
            </div>
            <div className="card-body">
              <p>
                difFUBAR (Differential Fast, Unconstrained Bayesian
                AppRoximation) detects sites under differential positive
                selection between tagged branch groups in a phylogeny.
              </p>
              <p>
                This method extends FUBAR to detect sites where the selective
                pressure differs significantly between predefined groups of
                branches.
              </p>
              <p>
                <strong>Input Requirements:</strong>
              </p>
              <ul>
                <li>Multiple sequence alignment in FASTA format</li>
                <li>Tagged phylogenetic tree in Newick format</li>
                <li>At least two tagged branch groups</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="progress hidden" id="file-progress">
          <div
            className="progress-bar"
            role="progressbar"
            aria-valuenow="0"
            aria-valuemin="0"
            aria-valuemax="100"
            style={{ width: "0%" }}
          >
            0%
          </div>
        </div>
      </div>
    );
  }
}

function difFubar_form() {
  ReactDOM.render(<DifFUBARForm />, document.getElementById("upload-form"));
}

module.exports = difFubar_form;