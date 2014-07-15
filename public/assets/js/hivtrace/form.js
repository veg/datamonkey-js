$(document).ready(function(){
});

$("form").submit(function(e) {
  //e.preventDefault();

  //Trigger elements
  $( "input[name='distance_threshold']" ).trigger('focusout');
  $( "input[name='min_overlap']" ).trigger('focusout');

  $(this).next('.help-block').remove();

  if($(this).find(".has-error").length > 0) {

    $("#form-has-error").show();
    return false;

  }

  $("#form-has-error").hide();

  //// Collect data to be posted
  //data = {};
  //data.distance_threshold = $( "input[name='distance_threshold']" ).val();
  //data.min_overlap = $( "input[name='min_overlap']" ).val();
  //data.receive_mail = $( "input[name='receive_mail']" ).prop("checked");
  //data.mail = $( "input[name='mail']" ).val();
  //data.public_db_compare = $( "input[name='public_db_compare']" ).prop("checked");
  //$(this).submit();
  return true;

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
