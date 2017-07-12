$(function () {
  function stickyFooter () {
    var height = $(window).innerHeight()
    $('.neal-page').css('min-height', height)
  }

  $(window).scroll(function () {
    var findHeader = $('.wrapper-slide').offset();
    if ($(this).scrollTop() > findHeader.top) {
      $('.neal-page').addClass('sticky')
      $('.standand-sort,.search-bar').addClass('animated slideInDown')
      $('.standand-sort,.search-bar,.block-back').removeClass('animated slideInUp')
    } else {
      $('.neal-page').removeClass('sticky')
      $('.standand-sort,.search-bar').removeClass('animated slideInDown')
      $('.standand-sort,.search-bar,.block-back').addClass('animated slideInUp')
    }
  })
  // sticky footer
  stickyFooter()
  $(document).ready(function (e) {
    stickyFooter()
  })
  $(window).on('scroll', function () {
    stickyFooter()
  })
  $(window).on('resize', function (e) {
    stickyFooter()
  })
})
