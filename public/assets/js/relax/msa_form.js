$(function() {
  $("form").submit(function(e) {
    e.preventDefault();

    $("#file-progress").removeClass("hidden");

    var formData = new FormData();
    var file = document.getElementById("seq-file").files[0];
    var filename = document.getElementById("seq-file").files[0].name;

    formData.append("files", file);
    formData.append("datatype", $("select[name='datatype']").val());
    formData.append("gencodeid", $("select[name='gencodeid']").val());
    formData.append("analysis_type", $("#analysis-type").val());
    formData.append(
      "receive_mail",
      $("input[name='receive_mail']").prop("checked")
    );
    formData.append("mail", $("input[name='mail']").val());

    var xhr = new XMLHttpRequest();

    xhr.open("post", "/relax/uploadfile", true);

    xhr.upload.onprogress = function(e) {
      if (e.lengthComputable) {
        var percentage = (e.loaded / e.total) * 100;
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
      if ("_id" in result) {
        window.location.href = "/relax/" + result._id + "/select-foreground";
      } else if ("error" in result) {
        $("#modal-error-msg").text(result.error);
        $("#errorModal").modal();
        $("#file-progress").css("display", "none");
        $("#seq-file").css("display", "block");
        $(".progress .progress-bar").css("width", "0%");
      }
    };

    xhr.send(formData);
  });
});

$(".mail-group").change(datamonkey.helpers.validate_email);
