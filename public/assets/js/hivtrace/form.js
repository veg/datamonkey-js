$(document).ready(function(){

  $("input[name='public_db_compare']").tooltip()

  $("form").submit(function(e) {

    e.preventDefault();

    $('#file-progress').removeClass("hidden");

    //Trigger elements
    $( "input[name='distance_threshold']" ).trigger('focusout');
    $( "input[name='min_overlap']" ).trigger('focusout');
    //$( "input[name='fraction']" ).trigger('focusout');

    $(this).next('.help-block').remove();

    if($(this).find(".has-error").length > 0) {

      $("#form-has-error").show();
      return false;

    }

    $("#form-has-error").hide();

    var formData = new FormData();

    var file = document.getElementById('seq-file').files[0];
    var filename = document.getElementById('seq-file').files[0].name;

    formData.append('files', file);

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

  // Validate an element that has min and max values
  var validate_element = function () {

    // Remove any non-numeric characters
    $(this).val($(this).val().replace(/[^\.0-9]/g, ''));

    // Check that it is not empty
    if($(this).val().length == 0) {
      $(this).next('.help-block').remove();
      $(this).parent().removeClass('has-success');
      $(this).parent().addClass('has-error');

      jQuery('<span/>', {
            class: 'help-block',
            text : 'Field is empty'
        }).insertAfter($(this));

    } else if($(this).val() < $(this).data('min')) {
      $(this).next('.help-block').remove();
      $(this).parent().removeClass('has-success');
      $(this).parent().addClass('has-error');

      jQuery('<span/>', {
            class: 'help-block',
            text : 'Parameter must be between ' + $(this).data('min') + ' and ' + $(this).data('max')
        }).insertAfter($(this));

    } else if($(this).val() > $(this).data('max')) {
      $(this).next('.help-block').remove();
      $(this).parent().removeClass('has-success');
      $(this).parent().addClass('has-error');
      jQuery('<span/>', {
            class: 'help-block',
            text : 'Parameter must be between ' + $(this).data('min') + ' and ' + $(this).data('max')
        }).insertAfter($(this));

    } else {
      $(this).parent().removeClass('has-error');
      $(this).parent().addClass('has-success');
      $(this).next('.help-block').remove();
    }
   
  }

  function validate_email(email) {

    if($(this).find("input[name='receive_mail']")[0].checked) {
      var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      if(regex.test($(this).find("input[name='mail']").val())) {
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

  function toggle_compare(obj) {

    if ($(this).val() != "HXB2_prrt") {
      $("input[name='public_db_compare']")[0].checked  = false;
      $(".checkbox").hide();
      $("#compare-notification").removeClass("hide")
      $("#compare-notification").show();
    } else {
      $(".checkbox").show();
      $("#compare-notification").hide();
    }

    if ($(this).val() != "Custom") {
      $("#trace-reference-upload").hide();
    } else {
      $("#trace-reference-upload").removeClass('hide');
      $("#trace-reference-upload").show();
    }

  }

  function toggle_fraction(obj) {
    if ($(this).val() != "RESOLVE") {
      $("input[name='fraction']").val('');
      $("#fraction").hide();
    } else {
      $("#fraction").removeClass("hide")
      $("#fraction").show();
    }
  }

  $( "input[name='distance_threshold']" ).focusout(validate_element);
  $( "input[name='min_overlap']" ).focusout(validate_element);
  $( "input[name='fraction']" ).focusout(validate_element);
  $( ".mail-group" ).change(validate_email);
  $( "select[name='reference']" ).change(toggle_compare);
  $( "select[name='ambiguity_handling']" ).change(toggle_fraction);
  $( "select[name='ambiguity_handling']" ).trigger('change');

});

