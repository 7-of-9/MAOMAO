import MobileDetect from 'mobile-detect'

export function isMobileBrowser (userAgent) {
  const md = new MobileDetect(userAgent)
  return !!md.mobile()
}

export function isChromeBrowser () {
  return !!window.chrome && !!window.chrome.webstore
}
