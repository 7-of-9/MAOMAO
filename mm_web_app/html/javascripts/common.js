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
    $('.control-sort li a').click(function() {
      $('.control-sort li a').removeClass('active');
      $(this).addClass('active');
    });
    $('.control-sort li a.bt-vert').click(function() {
      $('.grid-row-js').removeClass('grid-expend');
      return false;
    });

    $('.control-sort li a.bt-horizontal').click(function() {
      $('.grid-row-js').addClass('grid-expend');
      return false;
    });
  }

  return {
    init: function() {
      //handleSort();
      bind();

    }
  };

}();


$(document).ready(function() {
  App.init();
});
