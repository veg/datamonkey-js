var flea_files = [];

$(function () {

    'use strict';

    _.templateSettings = {
      evaluate:    /\{\%(.+?)\%\}/g,
      interpolate: /\{\{(.+?)\}\}/g,
      variable    : "rc"
    };

    $('#fileupload').fileupload({ dataType: 'json' })

    // Change this to the location of your server-side upload handler:
    var uploadButton = $('<button/>')
            .addClass('btn btn-primary')
            .prop('disabled', true)
            .text('Processing...')
            .on('click', function () {
                var $this = $(this),
                    data = $this.data();
                $this
                    .off('click')
                    .text('Abort')
                    .on('click', function () {
                        $this.remove();
                        data.abort();
                    });
                data.submit().always(function () {
                    $this.remove();
                });
            });

    $('#fileupload').fileupload({
        dataType: 'json',
        autoUpload: true,
        acceptFileTypes: /(\.|\/)(fastq)$/i,
        maxFileSize: 5000000,
        previewCrop: true
    }).on('fileuploadadd', function (e, data) {

      var fastq_template = _.template(
        $("script.fastq-file").html()
      );

      var fastq_files_html = fastq_template(data.files);
      $('#files').append(fastq_files_html);

      // Redefine triggers
      $( "input[type='date']" ).focusout(datamonkey.validate_date);
      flea_files.push.apply(flea_files, data.files);

    }).on('fileuploadprocessalways', function (e, data) {
        var index = data.index,
            file = data.files[index],
            node = $(data.context.children()[index]);
        if (file.preview) {
            node
                .prepend('<br>')
                .prepend(file.preview);
        }
        if (file.error) {
            node
                .append('<br>')
                .append($('<span class="text-danger"/>').text(file.error));
        }
        if (index + 1 === data.files.length) {
            data.context.find('button')
                .text('Upload')
                .prop('disabled', !!data.files.error);
        }
    }).on('fileuploadprogressall', function (e, data) {

        var progress = parseInt(data.loaded / data.total * 100, 10);

        d3.select("#flea-progress").classed({'hidden': false});
        d3.select("#files").classed({'hidden': true});

        $('#flea-progress .progress-bar').css(
            'width',
            progress + '%'
        );

        if(progress>95) {
          d3.select("#flea-progress").classed({'hidden': true});
          d3.select("#files").classed({'hidden': false});
        }


    }).on('fileuploaddone', function (e, data) {


        $.each(data.files, function (index, file) {
            if (file.url) {
                var link = $('<a>')
                    .attr('target', '_blank')
                    .prop('href', file.url);
                $(data.context.children()[index])
                    .wrap(link);
            } else if (file.error) {
                var error = $('<span class="text-danger"/>').text(file.error);
                $(data.context.children()[index])
                    .append('<br>')
                    .append(error);
            }

        });

    }).on('fileuploadfail', function (e, data) {
        $.each(data.files, function (index) {
            var error = $('<span class="text-danger"/>').text('File upload failed.');
            $(data.context.children()[index])
                .append('<br>')
                .append(error);
        });
    }).prop('disabled', !$.support.fileInput)
        .parent().addClass($.support.fileInput ? undefined : 'disabled');


  //On button click
  $("form").submit(function(e) {

    e.preventDefault();
    var self = this;

    var validate_uploads = function(callback) {

      // Ensure they are fastq files
      var validate_fastq = flea_files.every(function(elem) { return elem.name.indexOf('.fastq') != -1; });
      if (!validate_fastq) {
        callback({ msg : 'No files uploaded'});
      }

      if(!flea_files.length) {
        callback({ msg : 'No files uploaded'});
      } else if (!validate_fastq) {
        callback({ msg : 'All files must be in fastq format'});
      } else {
        callback();
      }

    }

    $( "input[type='date']" ).trigger('focusout');
    $( "input[name='min_overlap']" ).trigger('focusout');

    if($(".has-error").length > 0) {
      datamonkey.errorModal("This form has errors, please correct them before trying to continue.");
      return false;
    }


    validate_uploads(function(err) {
      if(err) {
        datamonkey.errorModal(err.msg);
      } else {

        // Append visit code and date to flea files
        var visit_codes = d3.selectAll("#files form .flea-visit-code input")[0].map(function(x) { return x.value });
        var visit_dates = d3.selectAll("#files form .flea-visit-date input")[0].map(function(x) { return x.value });

        var formData = new FormData();

        var fleaFileMap = function(file, i) {

          return {
                   'fn'            : file.name,
                   'last_modified' : file.lastModified,
                   'visit_code'    : visit_codes[i],
                   'visit_date'    : visit_dates[i]
                 }
        }

        // Create array from flea_files
        var mapped_fleas = JSON.stringify(flea_files.map(fleaFileMap));
        formData.append('flea_files', mapped_fleas);

        var xhr = new XMLHttpRequest();
        xhr.open('post', self.attributes.getNamedItem("action").value, true);

        xhr.onload = function(res) {
          // Replace field with green text, name of file
          var result = JSON.parse(this.responseText);

          if('_id' in result.flea) {
            window.location.href =  '/flea/' + result.flea._id;
          } else if ('error' in result) {
            datamonkey.errorModal(result.error);
          }
        };

        d3.select("#upload-button").html('<i class="fa fa-cog fa-spin fa-2x"></i>');

        xhr.send(formData);

      }
    });
  });
});

$( "input[type='date']" ).focusout(datamonkey.validate_date);

