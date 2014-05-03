$(document).ready(function(){

  if(!inProgress()) {
    createButtonsFromAttributes();
  }

});

function inProgress() {
  return $('.progress').length > 0;
}

function createButtonsFromAttributes() {
  // Get list of world country names
  var world_ids_url = "/assets/js/hivtrace/world-country-names.tsv";
  var json_url = $('#network_tag').data('url');

  //<li><a href="#">Country</a></li>
  //<li class="divider"></li>
  //<li><a href="#">Separated link</a></li>

  //Add list of them to .country-list
  //d3.tsv(world_ids_url, function(countries) {
  //  d3.select(".country-list").selectAll("li")
  //  .data(countries)
  //  .enter().append("li")
  //  .text(function(d) { return d.name; });
  //})


  d3.json(json_url, function(obj) {
    // Filter down each attribute
    // Get attributes from every object, get uniques for each
    // [node.attributes.YEAR_OF_SAMPLING for node in obj.Nodes]
    // years_of_sampling = obj.Nodes[iterator].attributes.YEAR_OF_SAMPLING
    // d3.set(years_of_sampling)

    //TODO: Generalize attributes

    // Countries 
    var map_countries = function(node) {
      return node.attributes.COUNTRY;
    }

    //var unique_countries = d3.set(obj.Nodes.map(map_countries));
    var unique_countries = d3.set(obj.Nodes.map(map_countries));

    //Add list
    d3.select(".country-list").selectAll("li")
    .data(unique_countries.values())
    .enter().append("li")
    .append('a')
    .text(function(d) { 
      return country_codes[d]; 
    });

    // Years of Sampling
    var map_years_of_sampling = function(node) {
      return node.attributes.YEAR_OF_SAMPLING;
    }

    var unique_years = d3.set(obj.Nodes.map(map_years_of_sampling));

    //Add list
    d3.select(".year-list").selectAll("li")
    .data(unique_years.values())
    .enter().append("li")
    .append('a')
    .text(function(d) { return d; });

    // Subtype
    var map_subtype = function(node) {
      return node.attributes.SUBTYPE;
    }

    var unique_subtypes = d3.set(obj.Nodes.map(map_subtype));

    //Add list
    d3.select(".subtype-list").selectAll("li")
    .data(unique_subtypes.values())
    .enter().append("li")
    .append('a')
    .text(function(d) { return d; });

  });

}
