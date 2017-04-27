import MobileDetect from 'mobile-detect'
import logger from '../utils/logger'

export function isMobileBrowser (userAgent) {
  const md = new MobileDetect(userAgent)
  logger.info('isMobileBrowser', userAgent, md)
  return !!md.mobile()
}

export function isChromeBrowser () {
  logger.info('isChromeBrowser', !!window.chrome && !!window.chrome.webstore)
  return !!window.chrome && !!window.chrome.webstore
}
