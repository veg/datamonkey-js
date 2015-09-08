$(function() {

  $("form").submit(function(e) {

    e.preventDefault();

    $('#file-progress').removeClass("hidden");
    d3.select('#fasta-button').style("display","none");  

    var formData = new FormData();
    var file = document.getElementById('seq-file').files[0];
    var filename = document.getElementById('seq-file').files[0].name;

    formData.append('files', file);
    formData.append('datatype', $( "select[name='datatype']" ).val());
    formData.append('gencodeid', $( "select[name='gencodeid']" ).val());
    formData.append('receive_mail',  $( "input[name='receive_mail']" ).prop("checked"));
    formData.append('mail', $( "input[name='mail']" ).val());


    var xhr = new XMLHttpRequest();

    xhr.open('post', '/busted/uploadfile', true);

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
        window.location.href =  '/busted/' + result._id + '/select-foreground';
      } else if ('error' in result) {
        $('#modal-error-msg').text(result.error);
        $('#errorModal').modal()
        $('#file-progress').css("display", "none");
        $('#seq-file').css("display", "block");
        $('.progress .progress-bar').css('width', '0%');

      }
    };

    xhr.send(formData);

  });
  
});

function validateEmail(email) {

  if($(this).find("input[name='receive_mail']")[0].checked) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if(regex.test($(this).find("input[name='mail']").val())) {
       // Give them green. They like that.
      $(this).removeClass('has-error');
      $(this).addClass('has-success');
      $(this).next('.help-block').remove();
    } else {
      $(this).next('.help-block').remove();
      $(this).removeClass('has-error');
      $(this).removeClass('has-success');
      $(this).addClass('has-error');
      var span = jQuery('<span/>', {
            class: 'help-block col-lg-9 pull-right',
            text : 'Invalid Email'
        }).insertAfter($(this));
    }
  } else {
    $(this).removeClass('has-error');
    $(this).removeClass('has-success');
    $(this).next('.help-block').remove();
  }

}

$(document).on('change', '#seq-file', function() {

    var input = $(this);
    var numFiles = input.get(0).files ? input.get(0).files.length : 1;
    var label = input.val().replace(/\\/g, '/').replace(/.*\//, '');

    $("#upload-file-info").html(label);

});

$( ".mail-group" ).change(validateEmail);
