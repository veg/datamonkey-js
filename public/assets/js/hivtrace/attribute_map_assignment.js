var attribute_unique_values = {},
    attribute_edit_group    = [];
    attribute_group_id_date = [];

$(".editable").bind( "click", function() {
  datamonkey.editable(this, attribute_unique_values, attribute_edit_group);
}).each (function (){
    attribute_unique_values [$(this).text()] = true;
    attribute_edit_group.push ([this, false]);
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
        attribute_group_id_date[0] = $(ids[0]).data ("field");
        attribute_group_id_date[1] = $(dates[0]).data ("field");
        $ ("#attr_group_id_date").parent().removeClass ("disabled");   
    }
});

function submit_new_map() {
  var url = '/hivtrace/' + $('#hivtrace_id').text() + '/save-attributes';

  /* collect all attribute names */
  
  var return_me     = {'annotation' : [],
                       'combine' : [] };
            
  
  $(".attr_field").each (function (index, value) {
    return_me['annotation'][parseInt($(value).data ("pk"))] = $(value).text();
  });
  
  
  if ($("#attr_group_id_date").is(":checked")) {
    return_me['combine'] = attribute_group_id_date;
  }
  

  $.ajax({
    type: 'POST',
    url: url,
    data: return_me,
    success: function(data) {
      window.location.replace('/hivtrace/' + $('#hivtrace_id').text());
    }
  });

}
