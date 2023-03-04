var React = require("react"),
  ReactDOM = require("react-dom"),
  createReactClass = require("create-react-class");

var NRMForm = createReactClass({
  onMailChange: function () {},

  submit: function (e) {
    e.preventDefault();

    $("#file-progress").removeClass("hidden");

    var formData = new FormData();
    var file = document.getElementById("seq-file").files[0];

    formData.append("files", file);

    formData.append("receive_mail", $("input[name='mail']").val().length > 0);
    formData.append("mail", $("input[name='mail']").val());

    var action_url = $("#msa-form").attr("action");
    var xhr = new XMLHttpRequest();

    xhr.open("post", action_url, true);

    xhr.upload.onprogress = function (e) {
      if (e.lengthComputable) {
        var percentage = (e.loaded / e.total) * 100;
        $("#file-progress").css("display", "block");
        $("#seq-file").css("display", "none");
        $(".progress .progress-bar").css("width", percentage + "%");
      }
    };

    xhr.onerror = function (e) {
      $("#file-progress").html(e);
    };

    xhr.onload = function (res) {
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
  },

  render: function () {
    return (
      <form
        id="msa-form"
        className="form-horizontal upload-form"
        name="uploadform"
        encType="multipart/form-data"
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

        <div className="form-group">
          <label id="datatype-content">Notify When Completed?</label>
          <div>
            <input
              name="mail"
              type="text"
              className="form-control"
              placeholder="Email Address"
            />
          </div>
        </div>
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
  },
});

function render_nrm_form() {
  ReactDOM.render(
    <NRMForm post_to={"/nrm"} />,
    document.getElementById("upload-form")
  );
}

module.exports = render_nrm_form;
