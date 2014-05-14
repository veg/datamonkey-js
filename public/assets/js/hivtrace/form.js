$(document).ready(function(){
});

$("form").submit(function(e) {
  e.preventDefault();

  //Trigger elements
  $( "input[name='distance_threshold']" ).trigger('focusout');
  $( "input[name='min_overlap']" ).trigger('focusout');

  $(this).next('.help-block').remove();

  if($(this).find(".has-error").length > 0) {
    $("#form-has-error").show();
    return false;
  }

  $("#form-has-error").hide();

  //Submit form
  var url = "/hivtrace/upload/" + $("#seq-file-div").data('fileid')

  // Collect data to be posted
  data = {};
  data.distance_threshold = $( "input[name='distance_threshold']" ).val();
  data.min_overlap = $( "input[name='min_overlap']" ).val();
  data.receive_mail = $( "input[name='receive_mail']" ).prop("checked");
  data.mail = $( "input[name='mail']" ).val();
  data.public_db_compare = $( "input[name='public_db_compare']" ).prop("checked");

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

// Validate an element that has min and max values
var validateElement = function () {

  // Remove any non-numeric characters
  $(this).val($(this).val().replace(/[^\.0-9]/g, ''));

  // Check that it is not empty
  if($(this).val().length == 0) {
    // Empty 
    $(this).next('.help-block').remove();
    $(this).parent().removeClass('has-success');
    $(this).parent().addClass('has-error');

    jQuery('<span/>', {
          class: 'help-block',
          text : 'Field is empty'
      }).insertAfter($(this));

  } else if($(this).val() < $(this).data('min')) {

    // We're being cheated
    $(this).next('.help-block').remove();
    $(this).parent().removeClass('has-success');
    $(this).parent().addClass('has-error');

    jQuery('<span/>', {
          class: 'help-block',
          text : 'Parameter must be between ' + $(this).data('min') + ' and ' + $(this).data('max')
      }).insertAfter($(this));

  } else if($(this).val() > $(this).data('max')) {

    // They're being too kind
    $(this).next('.help-block').remove();
    $(this).parent().removeClass('has-success');
    $(this).parent().addClass('has-error');
    jQuery('<span/>', {
          class: 'help-block',
          text : 'Parameter must be between ' + $(this).data('min') + ' and ' + $(this).data('max')
      }).insertAfter($(this));

  } else {
    // Give them green. They like that.
    $(this).parent().removeClass('has-error');
    $(this).parent().addClass('has-success');
    $(this).next('.help-block').remove();
  }
 
}

function ValidateEmail(email) {

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


$( "input[name='distance_threshold']" ).focusout(validateElement);
$( "input[name='min_overlap']" ).focusout(validateElement);
$( ".mail-group" ).change(ValidateEmail);


$(function() {

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
    
    xhr.open('post', '/hivtrace/uploadfile', true);

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

      //TODO: Handle error

      // set id
      $("#upload-button").prop("disabled",false);

    };
    
    xhr.send(formData);
    
  }
  
});
