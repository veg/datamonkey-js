$(".panel-datamonkey .panel-heading").hover(function(d) { 
  $(this).css("background-color", "#dddddd");
  $(this).find('span').removeClass('hide');
  $(this).find('span').show();
}, function(d) {
  $(this).css("background-color", "#F5F5F5");
  $(this).find('span').hide();
});
