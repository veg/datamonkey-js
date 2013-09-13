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
  var selector = "input[type='file']";

  $(selector).next('.help-block').remove();

  // Ensure that file is not empty
  if($(selector).val().length == 0) {

    $(selector).parent().addClass('has-error');

    jQuery('<span/>', {
          class: 'help-block',
          text : 'Field is empty'
      }).insertAfter($(selector));
    return false;
  } 

  $(selector).parent().removeClass('has-error');
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
    // Give them a green arrow. They like that.
    $(this).parent().removeClass('has-error');
    $(this).parent().addClass('has-success');
    $(this).next('.help-block').remove();
  }
 
}

$( "input[name='distance_threshold']" ).focusout(validateElement)
$( "input[name='min_overlap']" ).focusout(validateElement)

