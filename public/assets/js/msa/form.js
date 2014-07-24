$(function() {

  $("form").submit(function(e) {

    e.preventDefault();

    var formData = new FormData();
    var file = document.getElementById('seq-file').files[0];
    var filename = document.getElementById('seq-file').files[0].name;

    formData.append('files', file);
    formData.append('datatype', $( "select[name='datatype']" ).val());
    formData.append('gencodeid', $( "select[name='gencodeid']" ).val());

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
      var result = JSON.parse(this.responseText);
      console.log(result);
      if('_id' in result) {
        window.location.href =  '/msa/' + result._id + '/map-attributes';
      } else if ('error' in result) {
        $('#modal-error-msg').text(result.error);
        $('#errorModal').modal()
      }
    };

    xhr.send(formData);

  });
  
});
