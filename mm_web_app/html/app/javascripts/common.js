var App = function() {

  function handleSort() {
    //callback function shuffleme
    var $grid = $('.grid-row-js'),
      $sizer = $grid.find('.shuffle__sizer');

    $grid.shuffle({
      itemSelector: '.shuffle-item',
      sizer: $sizer
    });

    /* reshuffle when user clicks a filter item */
    $('.standand-sort .dropdown-menu li a').click(function(e) {
      e.preventDefault();
      // get group name from clicked item
      var groupName = $(this).attr('data-group');
      // reshuffle grid
      $grid.shuffle('shuffle', groupName);
    });
  }

  function bind() {
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      e.target // newly activated tab
      e.relatedTarget // previous active tab
      handleSort();
    })
    $('.control-sort li a').click(function() {
      $('.control-sort li a').removeClass('active');
      $(this).addClass('active');
    });
    $('.control-sort li a.bt-vert').click(function() {
      $('.grid-row .grid-item').removeClass('expend');
      return false;
    });

    $('.control-sort li a.bt-horizontal').click(function() {
      $('.grid-row .grid-item').addClass('expend');
      return false;
    });
  }

  return {
    init: function() {
      handleSort();
      bind();

    }
  };

}();


$(document).ready(function() {
  App.init();
  //init animation
  /*function animateElements() {
    var windowHeight = jQuery(window).height();
    $('.grid_row').each(function() {
      var imagePos = jQuery(this).offset().top;
      var topOfWindow = jQuery(window).scrollTop();
      if (imagePos < topOfWindow + windowHeight - 200) {
        $(this).find('.grid-item').each(function(index) {
          var self = jQuery(this);
          setTimeout(function() {
            self.addClass("animated fadeInUp");
          }, index * 500);
        });
      }
    });
  }
  setTimeout(function() {
    animateElements();
  }, 500);
  $(window).scroll(function() {
    animateElements();
  });*/
});
