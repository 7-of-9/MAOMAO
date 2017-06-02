$(document).ready(function() {
  $(window).scroll(function() {
    if ($(this).scrollTop() > 71) {
      $('.neal-page').addClass('sticky');
      $('.standand-sort,.search-bar').addClass('animated slideInDown');
    } else {
      $('.neal-page').removeClass('sticky');
      $('.standand-sort,.search-bar').removeClass('animated slideInDown');
    }
  });
});
