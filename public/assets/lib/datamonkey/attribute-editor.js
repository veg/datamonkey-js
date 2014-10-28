function datamonkey_cancel(self) {
  $(self).show();
  $(self).next().remove();
}

function datamonkey_change(elem, self) {
  $(self).html($(elem).closest('form').find('input').val());
  $(self).show();
  $(self).next().remove();
}

function datamonkey_editable(self) {
  $(self).hide();
  $(self).parent().append(
    $('<form />', { class: 'form-inline', role: 'form' }).append(
      $('<span>', { class: 'editable-container editable-inline'}).append(
        $('<div />', { class: 'editableform-loading' }).append(
          $('<form />', { class: 'form-inline editableform'}).append(
            $('<div />', { class: 'editable-input'}).append(
              $('<input />', { class: 'form-control input-sm', val: $(self).text()}).append(
                $('<span />', { class: 'editable-clear-x'})
              )
            ),
            $('<div />', { class: 'editable-buttons'}).append(
              $('<button />', { class: 'btn btn-primary btn-sm editable-submit', type: 'submit'}).append(
                $('<i />', { class: 'glyphicon glyphicon-ok'})
              ).click(function(e) { datamonkey_change(this, self); }),
              $('<button />', { class: 'btn btn-primary btn-sm editable-submit', type: 'submit'}).append(
                $('<i />', { class: 'glyphicon glyphicon-remove'})
              ).click(function(e) { datamonkey_cancel(self); })
            ),
            $('<div />', { class: 'editable-error-block help-block'})
          )
        )
      )
    )
  )
}

datamonkey.editable = datamonkey_editable;
