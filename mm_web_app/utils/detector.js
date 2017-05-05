import MobileDetect from 'mobile-detect'
import bowser from 'bowser'

export function isMobileBrowser (userAgent) {
  const md = new MobileDetect(userAgent)
  return !!md.mobile()
}

export function isChromeBrowser () {
  return bowser.chrome
}

export function browserName () {
  return bowser.name
}
