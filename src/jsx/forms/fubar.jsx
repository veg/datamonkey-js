var React = require("react"),
    ReactDOM = require("react-dom");

class FUBARForm extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      showAdvanced: false
    };
  }
  onMailChange() {
    //datamonkey.helpers.validate_email(elem);
  }

  submit(e) {

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
  
      <button className="btn" style={{display: "block"}}>
        Advanced options
        <span
          className={"glyphicon glyphicon-menu-"+(this.state.showAdvanced ? "down" : "right")}
          aria-hidden="true"
        />
      </button>

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
