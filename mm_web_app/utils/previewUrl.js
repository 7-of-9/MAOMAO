
export default function previewUrl (url, name) {
  const PROXY_URL = '/api/preview'
  const proxyUrl = `${PROXY_URL}?url=${url}`
  return (
    <iframe
      sandbox='allow-scripts allow-same-origin'
      id={`frame-${name}`}
      name={`frame-${name}`}
      width='100%'
      height='100%'
      frameBorder='0'
      allowFullScreen
      allowTransparency
      src={proxyUrl} />
  )
}
