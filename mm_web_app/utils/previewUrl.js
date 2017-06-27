const PROXY_URL = '/api/preview'

export default function previewUrl (url, name) {
  /* global $ */
  $.fancybox.close()
  // Open the fancyBox right away
  if (url.indexOf('youtube.com') !== -1 || url.indexOf('vimeo.com') !== -1) {
    $.fancybox.open({
      src: url
    })
  } else {
    const proxyUrl = `${PROXY_URL}?url=${url}`
    $.fancybox.open({
      src: proxyUrl,
      type: 'iframe',
      opts: {
        caption: name,
        iframe: {
          tpl: '<iframe sandbox="allow-scripts" id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen allowtransparency="true" src=""></iframe>'
        }
      }
    })
  }
}
