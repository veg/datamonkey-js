$(document).ready(function(){

  $("input[name='public_db_compare']").tooltip()

  $("form").submit(function(e) {

    e.preventDefault();


    //Trigger elements
    $( "input" ).trigger('focusout');

    $(this).next('.help-block').remove();


    var file_element = $('#seq-file'),
        file_list    = file_element.prop ("files");
    
    
    if (file_list.length == 0) { // no file selected
        display_validation_fail_block (file_element, "No sequence file chosen");
        return false;
    } else {
        field_passes_validation (file_element);
    }
    
    if($(this).find(".has-error").length > 0) {
      $("#form-has-error").show();
      return false;
    }

    var filename = file_list[0].name;

    $('#file-progress').removeClass("hidden");
    $("#form-has-error").hide();

    var formData = new FormData();


    formData.append('files', file_list[0]);

    formData.append('reference', $( "select[name='reference']" ).val());

    if( $( "select[name='reference']" ).val() == 'Custom') {
      if( document.getElementById('reference-file').files.length == 0) {
        datamonkey.errorModal('You selected to upload your own reference, but did not supply one');
        return;
      } else {
        var ref_file = document.getElementById('reference-file').files[0];
        var ref_filename = document.getElementById('reference-file').files[0].name;
        formData.append('ref_file', ref_file);
      }
    }

    formData.append('distance_threshold', $( "input[name='distance_threshold']" ).val());
    formData.append('ambiguity_handling', $( "select[name='ambiguity_handling']" ).val());
    formData.append('min_overlap', $( "input[name='min_overlap']" ).val());
    formData.append('strip_drams', $( "select[name='strip_drams']" ).val());
    formData.append('fraction', $( "input[name='fraction']" ).val());
    formData.append('filter_edges', $( "select[name='filter_edges']" ).val());
    formData.append('reference_strip', $( "select[name='reference_strip']" ).val());
    formData.append('receive_mail',  $( "input[name='receive_mail']" ).prop("checked"));
    formData.append('mail', $( "input[name='mail']" ).val());
    formData.append('public_db_compare', $( "input[name='public_db_compare']" ).prop("checked"));

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
      var result = JSON.parse(this.responseText);
      if('_id' in result) {
        window.location.href =  '/hivtrace/' + result._id + '/map-attributes';
      } else if ('error' in result) {
        $('#file-progress').css("display", "none");
        $('#seq-file').css("display", "block");
        $('.progress .progress-bar').css('width', '0%');
        datamonkey.errorModal(result.error);
      }
    };

    xhr.send(formData);

  });

  function display_validation_fail_block (field, message) {
      $(field).next('.help-block').remove();
      $(field).parent().removeClass('has-success').addClass('has-error');


      return jQuery('<span/>', {
            class: 'help-block',
            text : message
        }).insertAfter($(field));
  }
  
  function field_passes_validation (field) {
    $(field).parent().removeClass('has-error').addClass('has-success');
    $(field).next('.help-block').remove();
  }

  function field_has_no_data (field) {
    $(field).parent().removeClass('has-error has-success');
    $(field).next('.help-block').remove();
  }
   
  
  // Validate an element that has min and max values
  var validate_element = function () {
    // see if the field is hidden; is so ignore it
    
    if ($(this).filter (":hidden").size ()) {
        return true;
    }
    
    var value = $(this).val();
    
    if (value == "") { // try default
        value = $(this).prop ("placeholder");
    }
    
    var parsed_float = parseFloat (value);
    
    // this checks for NaN
    if (parsed_float !== parsed_float) {
        display_validation_fail_block (this, "Please enter a number in this field"); 
        return false;
    }
 
    // this checks for range compliance    
    if(parsed_float < $(this).data('min') || parsed_float > $(this).data('max')) {
        display_validation_fail_block (this, "The value you entered is out of the permissible range [" + $(this).data('min') + " - " + $(this).data('max') + "]"); 
        return false;        
    }
   
    field_passes_validation (this); 
    $(this).val (value); // set the value to what was parsed and validated (e.g. the default)
    return true;
  }

    function validate_email_regexp (email){
        // from http://badsyntax.co/post/javascript-email-validation-rfc822
            return /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/.test( email );
    }

  function validate_email(email) {
    
    var mail_field = $(this).find("input[name='receive_mail']");
    
 
    if (mail_field.filter (":checked").size () == 1)  {
       if(validate_email_regexp($(this).find("input[name='mail']").val())) {
        field_passes_validation (mail_field.parent().parent());
      } else {
          display_validation_fail_block (mail_field.parent().parent(), "Please enter a valid e-mail address");
          return false; 
      }
    } else {
      field_has_no_data (mail_field.parent().parent());
    }
    return true;
  }
  
  function handle_helper_element (obj) {
    var selected_option = $(obj).find (":selected");
    var help_text = $(selected_option).data ("help_text");
    if (help_text) {
        $ ("#" + $(obj).attr ("id") + "-help").html (help_text);
    }
  }

  function toggle_compare(obj) {

    if ($(this).find (":selected").data ('dram')) {
      $("#dram").removeClass("hide").show();
    } else {
      $("#dram").hide().find ("select").val ("no").trigger ("change");
    }

    if ($(this).find (":selected").data ('can_compare')) {
      $("input[name='public_db_compare']").parent().show();
      $("#compare-notification").hide();
    } else {
      $("input[name='public_db_compare']").prop ("checked", false).parent().hide();
      $("#compare-notification").removeClass("hide").show();
    }

    if ($(this).val() != "Custom") {
      $("#trace-reference-upload").hide();
    } else {
      $("#trace-reference-upload").removeClass('hide').show();
    }
    
    handle_helper_element (this);
    
  }

  function toggle_fraction(obj) {
    if ($(this).val() != "RESOLVE") {
      $("input[name='fraction']").val('');
      $("#fraction").hide();
    } else {
      $("#fraction").removeClass("hide").show();
    }
    
    handle_helper_element (this);
  }

  function toggle_helper (obj) {    
    handle_helper_element (this);
  }
  

  $( "input[name='distance_threshold']" ).focusout(validate_element);
  $( "input[name='min_overlap']" ).focusout(validate_element);
  $( "input[name='fraction']" ).focusout(validate_element);
  $( ".mail-group" ).change(validate_email);
  $( "#seq-file" ).change(function (e) {
    field_passes_validation (this);
  });
  $( "select[name='reference']" ).change(toggle_compare).trigger ('change');
  $( "select[name='ambiguity_handling']" ).change(toggle_fraction).trigger('change');
  $( "select[name='strip_drams']" ).change(toggle_helper).trigger('change');
  $( "select[name='filter_edges']" ).change(toggle_helper).trigger('change');
  $( "select[name='reference_strip']" ).change(toggle_helper).trigger('change');
  
  // set shared attributes on helper_text element
  $( ".helper_text").attr ("data-container", "body")
                      .attr ("data-toggle", "popover")
                      .attr ("data-trigger", "hover click")
                      .attr ("data-placement", "bottom")
                      .attr ("data-html", "true");
  
  
  // initialize helper toggles
  $(function () { 
    $('[data-toggle="popover"]').popover()
  });

});

