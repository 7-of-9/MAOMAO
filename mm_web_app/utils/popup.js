const defaultOptions = {
  toolbar: 'no',
  location: 'no',
  directories: 'no',
  status: 'no',
  menubar: 'no',
  scrollbars: 'yes',
  resizable: 'yes',
  width: 500,
  height: 400,
  top: (o, w) => ((w.innerHeight - o.height) / 2) + w.screenY,
  left: (o, w) => ((w.innerWidth - o.width) / 2) + w.screenX
}

const createOptions = () => {
  const ret = []
  /* eslint-disable no-restricted-syntax */
  for (const key in defaultOptions) {
    if (Object.prototype.hasOwnProperty.call(defaultOptions, key)) {
      ret.push(`${key}=${
         typeof defaultOptions[key] === 'function'
           ? defaultOptions[key].call(this, defaultOptions, window)
           : defaultOptions[key]}`
     )
    }
  }
  return ret.join(',')
}

export default function openUrl (url) {
  window.open(url, 'Loading', createOptions())
}
