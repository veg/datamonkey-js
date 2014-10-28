$(".editable").bind( "click", function() {
  datamonkey.editable(this);
});

$('#attr_submit').bind( 'click', function() {
  datamonkey_submit_new_map();
});

$('#attr_skip').bind('click', function() {
  datamonkey_submit_new_map();
});

function datamonkey_submit_new_map() {
  var url = '/msa/' + $('#msa_id').text() + '/save-attributes';

  new_map = {};
  new_map.map = [];
  new_map.delimiter = $('#delimiter').text()
                
  // Collect data
  for(var i = 0; i < $('.attr_field').length; i++) {
    new_map.map.push($('.attr_field')[i].text);
  }

  $.ajax({
    type: 'POST',
    url: url,
    data: new_map,
    success: function(data) { 
      window.location.replace('/msa/' + $('#msa_id').text());  
    }
  });

}
