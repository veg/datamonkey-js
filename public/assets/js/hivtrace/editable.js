$(".editable").bind( "click", function() {
  editable(this);
});

function cancel(self) {
  $(self).show();
  $(self).next().remove();
}

function change(elem, self) {
  $(self).html($(elem).closest('form').find('input').val());
  $(self).show();
  $(self).next().remove();
}

function editable (self) {
  $(self).hide();
  $(self).parent().append(
    $('<form />', { class: 'form-inline', role: 'form' }).append(
      $('<span>', { class: 'editable-container editable-inline'}).append(
        $('<div />', { class: 'editableform-loading' }).append(
          $('<form />', { class: 'form-inline editableform'}).append(
            $('<div />', { class: 'editable-input'}).append(
              $('<input />', { class: 'form-control input-sm', val:  $(self).text()}).append(
                $('<span />', { class: 'editable-clear-x'})
              )
            ),
            $('<div />', { class: 'editable-buttons'}).append(
              $('<button />', { class: 'btn btn-primary btn-sm editable-submit', type: 'submit'}).append(
                $('<i />', { class: 'glyphicon glyphicon-ok'})              
              ).click(function(e) { change(this, self); }),
              $('<button />', { class: 'btn btn-primary btn-sm editable-submit', type: 'submit'}).append(
                $('<i />', { class: 'glyphicon glyphicon-remove'})
              ).click(function(e) { cancel(self); })
            ),
            $('<div />', { class: 'editable-error-block help-block'})
          )
        )
      )
    )
  )
}

$("#attr_submit").bind( "click", function() {
  submitNewMap();
});

$("#attr_skip").bind( "click", function() {
  submitNewMap();
});

function submitNewMap() {
  var url = "/hivtrace/invoke/" + $("#hivtrace_id").text();

  new_map = {};
  new_map.map = [];
  new_map.delimiter = $("#delimiter").text()
                
  // Collect data
  for(var i = 0; i < $(".attr_field").length; i++) {
    new_map.map.push($(".attr_field")[i].text);
  }

  $.ajax({
    type: "POST",
    url: url,
    data: new_map,
    success: function(data) { window.location.replace(data);  }
  });

}

