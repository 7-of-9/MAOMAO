$(function () {
  function stickyFooter () {
    var height = $(document).height()
    $('.neal-page').css('min-height', height)
  }

  $(window).scroll(function () {
    if ($(this).scrollTop() > 71) {
      $('.neal-page').addClass('sticky')
      $('.standand-sort,.search-bar').addClass('animated slideInDown')
    } else {
      $('.neal-page').removeClass('sticky')
      $('.standand-sort,.search-bar').removeClass('animated slideInDown')
    }
  })
    // sticky footer
  stickyFooter()
  $(window).on('load', function (e) {
    stickyFooter()
  })
  $(window).on('resize', function (e) {
    stickyFooter()
  })
})
