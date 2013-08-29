$(document).ready(function(){
});

$("form").submit(function() {

  //Trigger elements
  $( "input[name='distance_threshold']" ).trigger('focusout');
  $( "input[name='min_overlap']" ).trigger('focusout');
  validateFile();


  $(this).next('.help-inline').remove();

  if($(this).find(".error").length > 0) {
    $("#form-error").show();
    return false;
  }

  $("#form-error").hide();
  return true;

});

var validateFile = function() {
  var selector = "input[type='file']";

  $(selector).next('.help-inline').remove();

  // Ensure that file is not empty
  if($(selector).val().length == 0) {

    $(selector).parent().addClass('error');

    jQuery('<span/>', {
          class: 'help-inline',
          text : 'Field is empty'
      }).insertAfter($(selector));
    return false;
  } 

  $(selector).parent().removeClass('error');
  return true;
}

// Validate an element that has min and max values
var validateElement = function () {

  // Remove any non-numeric characters
  $(this).val($(this).val().replace(/[^\.0-9]/g, ''));

  // Check that it is not empty
  if($(this).val().length == 0) {
    // Empty 
    $(this).next('.help-inline').remove();
    $(this).parent().removeClass('success');
    $(this).parent().addClass('error');

    jQuery('<span/>', {
          class: 'help-inline',
          text : 'Field is empty'
      }).insertAfter($(this));

  } else if($(this).val() < $(this).data('min')) {

    // We're being cheated
    $(this).next('.help-inline').remove();
    $(this).parent().removeClass('success');
    $(this).parent().addClass('error');

    jQuery('<span/>', {
          class: 'help-inline',
          text : 'Parameter must be between ' + $(this).data('min') + ' and ' + $(this).data('max')
      }).insertAfter($(this));

  } else if($(this).val() > $(this).data('max')) {

    // They're being too kind
    $(this).next('.help-inline').remove();
    $(this).parent().removeClass('success');
    $(this).parent().addClass('error');
    jQuery('<span/>', {
          class: 'help-inline',
          text : 'Parameter must be between ' + $(this).data('min') + ' and ' + $(this).data('max')
      }).insertAfter($(this));

  } else {
    // Give them a green arrow. They like that.
    $(this).parent().removeClass('error');
    $(this).parent().addClass('success');
    $(this).next('.help-inline').remove();
  }
 
}

$( "input[name='distance_threshold']" ).focusout(validateElement)
$( "input[name='min_overlap']" ).focusout(validateElement)

