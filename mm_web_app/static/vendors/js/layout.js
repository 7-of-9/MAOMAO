/* global Bricklayer */
$(function () {
  var bricklayer = new Bricklayer(document.querySelector('.bricklayer'))

  bricklayer.on('breakpoint', function (e) {
    console.log(e.detail.columnCount)
  })

  bricklayer.on('afterPrepend', function (e) {
    var el = e.detail.item
    el.classList.add('is-prepend')
    setTimeout(function () {
      el.classList.remove('is-prepend')
    }, 500)
  })

  bricklayer.on('afterAppend', function (e) {
    var el = e.detail.item
    el.classList.add('is-append')
    setTimeout(function () {
      el.classList.remove('is-append')
    }, 500)
  })
})
