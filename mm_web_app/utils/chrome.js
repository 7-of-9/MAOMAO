import * as logger from 'loglevel'
import { EXTENSION_ID } from '../containers/App/constants'

/* global chrome */
export function hasInstalledExtension () {
  return document.getElementById('maomao-extension-anchor') !== null || (chrome.app.isInstalled)
}

export function sendMsgToChromeExtension (payload, callback = () => {}) {
  if (chrome) {
    chrome.runtime.sendMessage(EXTENSION_ID, { type: 'chromex.dispatch', portName: 'maomao-extension', payload },
    (response) => {
      logger.warn('response from extension', payload, response)
      if (callback) {
        callback(response.error, response.value)
      }
    })
  } else {
    logger.error('ONLY SUPPORT CHROME')
  }
}

export function actionCreator (type, payload) {
  return {
    type,
    payload
  }
}
