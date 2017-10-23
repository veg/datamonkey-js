var React = require("react"),
    ReactDOM = require("react-dom");

class FUBARForm extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      showAdvanced: false
    };
    this.toggleShow = this.toggleShow.bind(this);
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
  submit(e) {
    console.log("submit");
    e.preventDefault();

    $('#file-progress').removeClass("hidden");

    var formData = new FormData();
    var file = document.getElementById('seq-file').files[0];
    var filename = document.getElementById('seq-file').files[0].name;

    formData.append('files', file);
    formData.append('datatype', $( "select[name='datatype']" ).val());
    formData.append('gencodeid', $( "select[name='gencodeid']" ).val());
    formData.append('receive_mail',  $( "input[name='receive_mail']" ).prop("checked"));
    formData.append('mail', $( "input[name='mail']" ).val());
    formData.append('number_of_grid_points', $( 'number_of_grid_points' ).val());
    formData.append('number_of_mcmc_chains', $( 'number_of_mcmc_chains' ).val());
    formData.append('length_of_each_chain', $( 'length_of_each_chain' ).val());
    formData.append('number_of_burn_in_samples', $( 'number_of_burn_in_samples' ).val());
    formData.append('number_of_samples', $( 'number_of_samples' ).val());
    formData.append('concentration_of_dirichlet_prior', $( 'concentration_of_dirichlet_prior' ).val());

    var action_url = $('#msa-form').attr('action'); 

    var xhr = new XMLHttpRequest();

    xhr.open('post', '/fubar', true);

    xhr.upload.onprogress = function(e) {
      if (e.lengthComputable) {
        var percentage = (e.loaded / e.total) * 100;
        $('#file-progress').css("display", "block");
        $('#seq-file').css("display", "none");
        $('.progress .progress-bar').css('width', percentage + '%');
      }
    };
    
    xhr.onerror = function(e) {
      $('#file-progress').html(e);
    };
    
    xhr.onload = function(res) {

      // Replace field with green text, name of file
      var result = JSON.parse(this.responseText);

      if(_.has(result, 'error')) {
        $('#modal-error-msg').text(result.error);
        $('#errorModal').modal()
        $('#file-progress').css("display", "none");
        $('#seq-file').css("display", "block");
        $('.progress .progress-bar').css('width', '0%');
      } else if ('error' in result.analysis) {
        $('#modal-error-msg').text(result.error);
        $('#errorModal').modal()
        $('#file-progress').css("display", "none");
        $('#seq-file').css("display", "block");
        $('.progress .progress-bar').css('width', '0%');
      } else if('upload_redirect_path' in result) {
        window.location.href =  result.upload_redirect_path;
      } else {
        $('#modal-error-msg').text("We received data in an unexpected format from the server.");
        $('#errorModal').modal()
        $('#file-progress').css("display", "none");
        $('#seq-file').css("display", "block");
        $('.progress .progress-bar').css('width', '0%');
      }

    };

    xhr.send(formData);


  }

  render() {
    var self = this;
    return(<form id="msa-form" className="form-horizontal upload-form" name="uploadform" enctype="multipart/form-data" method="post" action= {this.props.post_to} >

      <div id="seq-file-div" className="upload-div">
          <input id="seq-file" type="file" name="files"></input>
          <div id="file-progress" className="progress progress-striped active hidden">
              <div className="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="1" aria-valuemax="100">
                <span className="sr-only">0% Complete</span>
              </div>
          </div>  
      </div>

      <div className="upload-div">
        <label id="geneticcode-content">Genetic code<a href="/help#genetic-code" target="_blank"><sup>?</sup></a></label>
        <select name="gencodeid">

          <option value="0">
            Universal code
          </option>

          <option value="1">
            Vertebrate mitochondrial DNA code
          </option>

          <option value="2">
            Yeast mitochondrial DNA code
          </option>

          <option value="3">
            Mold, Protozoan and Coelenterate mt;
            Mycloplasma/Spiroplasma
          </option>

          <option value="4">
            Invertebrate mitochondrial DNA code
          </option>

          <option value="5">
            Ciliate, Dasycladacean and Hexamita Nuclear code
          </option>

          <option value="6">
            Echinoderm mitochondrial DNA code
          </option>

          <option value="7">
            Euplotid Nuclear code
          </option>

          <option value="8">
            Alternative Yeast Nuclear code
          </option>

          <option value="9">
            Ascidian mitochondrial DNA code
          </option>

          <option value="10">
            Flatworm mitochondrial DNA code
          </option>

          <option value="11">
            Blepharisma Nuclear code
          </option>

        </select> 
      </div>

      <div className="form-group">
        <label id="datatype-content" className="col-lg-3 control-label">Notify When Completed?</label>
        <div className="col-lg-9 input-group mail-group">
          <span className="input-group-addon">
            <input name="receive_mail" type="checkbox" defaultValue="on"></input>
          </span>
          <input name="mail" type="text" className="form-control" placeholder="Email Address"></input>
        </div>
      </div>
  
      <button
        className="btn"
        type="button"
        onClick={self.toggleShow}
        style={{display: "block", verticalAlign: "middle"}}
      >
        Advanced options
        {" "}<span
          style={{verticalAlign: "middle"}}
          className={"glyphicon glyphicon-menu-"+(this.state.showAdvanced ? "down" : "right")}
          aria-hidden="true"
        />
      </button>

      <div style={{display: self.state.showAdvanced ? "block" : "none"}}>
        <div className="row">
          <div className="col-md-6">  
            <div>
              <label>Number of grid points</label> 
              <input name="number_of_grid_points" className="form-control" type="number" defaultValue="20" step="1" min="5" max="50" />
            </div>

            <div>
              <label>Number of MCMC chains</label> 
              <input name="number_of_mcmc_chains" className="form-control" type="number" defaultValue="5" step="1" min="2" max="20" />
            </div>

            <div>
              <label>Length of each chain</label> 
              <input name="length_of_each_chain" className="form-control" type="number" defaultValue="2000000" step="500000" min="500000" max="50000000" />
            </div>
          </div>
          <div className="col-md-6">  
            <div>
              <label>Use this many samples as burn-in</label> 
              <input name="number_of_burn_in_samples" className="form-control" type="number" defaultValue="1000000" step="500000" min="100000" max="1900000" />
            </div>

            <div>
              <label>How many samples should be drawn from each chain?</label> 
              <input name="number_of_samples" className="form-control" type="number" defaultValue="100" step="1" min="50" max="1000000" />
            </div>

            <div>
              <label>Concentration parameter of the Dirichlet prior</label> 
              <input name="concentration_of_dirichlet_prior" className="form-control" type="number" defaultValue=".5" step="1" min="0.001" max="1" />
            </div>
          </div>
        </div>
      </div>

      <button type="submit" className="btn pull-right" onClick={this.submit}><span className="dm-continue-btn glyphicon glyphicon-play"></span></button>
    </form>
    )
  }

}

function render_fubar_form() {
  ReactDOM.render(
    <FUBARForm post_to={"fubar"}/>, document.getElementById("upload-form")
  );
}


module.exports = render_fubar_form;
