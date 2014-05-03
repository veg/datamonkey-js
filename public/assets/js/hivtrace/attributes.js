$(document).ready(function(){
  getAttributeMap();
});

function getAttributeMap() {
  var hivtraceid = $('#hiv-cluster-report').data('hivtraceid')
  $.get(hivtraceid + '/attributemap', function(attribute_map) {
    console.log(attribute_map);
  });
}
