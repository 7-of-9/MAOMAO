
export default function previewUrl (url, name, width = '100%', height = '100%', onload = () => {}) {
  const PROXY_URL = '/api/preview'
  const proxyUrl = `${PROXY_URL}?url=${url}`
  return (
    <iframe
      sandbox='allow-same-origin'
      id={`frame-${name}`}
      name={`frame-${name}`}
      width={width}
      height={height}
      frameBorder='0'
      allowFullScreen
      allowTransparency
      onLoad={onload()}
      src={proxyUrl}
      />
  )
}
