var attribute_unique_values = {},
    attribute_edit_group    = [];

$(".editable").bind( "click", function() {
  datamonkey.editable(this, attribute_unique_values, attribute_edit_group);
}).each (function (){
    attribute_unique_values [$(this).text()] = true;
    attribute_edit_group.push ([this, false]);
});

$("#attr_continue").bind( "click", function() {
  submit_new_map();
});

$("#attr_continue").bind( "click", function() {
  submit_new_map();
});


$("[data-category][data-field]").on ("click", function () {
    var all_fields = $("[data-category][data-field]").filter (":checked"),
        dates      = all_fields.filter ('[data-category="temporal"]'),
        ids        = all_fields.filter ('[data-category="individual"]');
        
    if (dates.length != 1 || ids.length != 1) {
        $ ("#attr_group_id_date").parent().addClass ("disabled");
    } else {
        $ ("#attr_group_id_date").parent().removeClass ("disabled");   
    }
});

function submit_new_map() {
  var url = '/hivtrace/' + $('#hivtrace_id').text() + '/save-attributes';

  console.log (map);

  new_map = {};
  new_map.map = [];
  new_map.delimiter = $("#delimiter").text()

  // Collect data
  for(var i = 0; i < $(".attr_field").length; i++) {
    new_map.map.push($(".attr_field")[i].text);
  }

  $.ajax({
    type: 'POST',
    url: url,
    data: new_map,
    success: function(data) {
      window.location.replace('/hivtrace/' + $('#hivtrace_id').text());
    }
  });

}
