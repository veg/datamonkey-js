$(function() {

  $("form").submit(function(e) {
    e.preventDefault();

    //Submit form
    var url = "/msa/" + $("#seq-file-div").data('fileid')

    // Collect data to be posted
    data = {};
    data.datatype  = $( "select[name='datatype']" ).val();
    data.gencodeid = $( "select[name='gencodeid']" ).val();

    $.ajax({
      type: "POST",
      url: url,
      data: data,
      success: function (data, textStatus, xhr) {
          $("#container").replaceWith(data);
      },
      error: function (xhr, textStatus, errorThrown) {
          //$('.rtnMsg').html("opps: " + textStatus + " : " + errorThrown);
          //myRtnA = "Error"
          //return myRtnA;
      }
    });

  });

  $("#seq-file").change(function(evt) {
    uploadForm(evt);
  });
  
  function uploadForm(evt) {
    evt.preventDefault();
    $("#upload-button").prop("disabled",true);

    //$('div.progress').show();
    var formData = new FormData();
    var file = document.getElementById('seq-file').files[0];
    var filename = document.getElementById('seq-file').files[0].name;

    formData.append('files', file);
    
    var xhr = new XMLHttpRequest();
    
    xhr.open('post', '/msa/uploadfile', true);

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
      $("#seq-file-div").empty()
      $("#seq-file-div").append($('<div />').html('<span class="text-success">' + filename + '</span> successfully uploaded')
                                            .css('padding-top','5px'));

      var result = JSON.parse(this.responseText).result;
      if('_id' in result) {
        $("#seq-file-div")[0].setAttribute('data-fileid', result._id);
      }

      // set id
      $("#upload-button").prop("disabled",false);

    };
    
    xhr.send(formData);
    
  }
  
});
