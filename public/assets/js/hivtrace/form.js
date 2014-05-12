$(document).ready(function(){
});

$("form").submit(function() {

  //Trigger elements
  $( "input[name='distance_threshold']" ).trigger('focusout');
  $( "input[name='min_overlap']" ).trigger('focusout');
  validateFile();


  $(this).next('.help-block').remove();

  if($(this).find(".has-error").length > 0) {
    $("#form-has-error").show();
    return false;
  }

  $("#form-has-error").hide();
  return true;

});

var validateFile = function() {

  var selector = "#trace-upload";
  var input_field = "input[type='file']";
  $(selector).removeClass('has-error');


  $(selector).next('.help-div').remove();

  // Ensure that file is not empty
  if($(input_field).val().length == 0) {

    $(selector).addClass('has-error');

    var help_div = jQuery('<div/>', {
          class: 'col-lg-9',
      });

    var help_span = jQuery('<span/>', {
          class: 'help-block',
          text : 'Field is empty'
      });

      $(selector).append(help_div.append(help_span));

    return false;
  } 

  $(selector).removeClass('has-error');
  return true;
}

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

    //$('div.progress').show();
    var formData = new FormData();
    var file = document.getElementById('seq-file').files[0];
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
      //showInfo('An error occurred while submitting the form. Maybe your file is too big');
    };
    
    xhr.onload = function() {
      // Show that it is complete
    };
    
    xhr.send(formData);
    
  }
  
});
