$(document).ready(function() {
  // sticky header
  $(window).scroll(function() {
    if ($(this).scrollTop() > 71) {
      $('.neal-page').addClass('sticky');
      $('.standand-sort,.search-bar').addClass('animated slideInDown');
    } else {
      $('.neal-page').removeClass('sticky');
      $('.standand-sort,.search-bar').removeClass('animated slideInDown');
    }
  });
  // sticky footer
  sticky_footer();
  $(window).resize(function() {
    sticky_footer();
  }).load(function() {
    sticky_footer();
  });
});
// sticky footer
function sticky_footer() {
  var height_document = $(document).height();
  $('.neal-page').css('min-height', height_document);
}
