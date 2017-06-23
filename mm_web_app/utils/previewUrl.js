const PROXY_URL = '/api/preview'

export default function previewUrl (url, name) {
  /* global $ */
  $.fancybox.close()
  // Open the fancyBox right away
  const proxyUrl = `${PROXY_URL}?url=${url}`
  $.fancybox.open({
    src: proxyUrl,
    type: 'iframe',
    opts: {
      caption: name
    }
  })
}
