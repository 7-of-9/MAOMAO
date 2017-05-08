import { EXTENSION_ID } from '../containers/App/constants'

/* global chrome */
export function hasInstalledExtension () {
  return document.getElementById('maomao-extension-anchor') !== null || (chrome.app && chrome.app.isInstalled)
}

export function sendMsgToChromeExtension (payload, callback = () => { }) {
  if (chrome) {
    chrome.runtime.sendMessage(EXTENSION_ID, { type: 'chromex.dispatch', portName: 'maomao-extension', payload },
      (response) => {
        if (callback && response) {
          callback(response.error, response.value)
        }
      })
  } else {
  }
}

export function actionCreator (type, payload) {
  return {
    type,
    payload
  }
}
