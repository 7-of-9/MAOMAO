import MobileDetect from 'mobile-detect'
import browser from 'detect-browser'

export function isMobileBrowser (userAgent) {
  const md = new MobileDetect(userAgent)
  return !!md.mobile()
}

export function browserName () {
  return browser && browser.name
}
