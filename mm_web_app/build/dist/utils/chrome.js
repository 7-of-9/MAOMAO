'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasInstalledExtension = hasInstalledExtension;
exports.sendMsgToChromeExtension = sendMsgToChromeExtension;

var _loglevel = require('loglevel');

var logger = _interopRequireWildcard(_loglevel);

var _constants = require('../containers/App/constants');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/* global chrome */
function hasInstalledExtension() {
  return document.getElementById('maomao-extension-anchor') !== null || chrome.app.isInstalled;
}

function sendMsgToChromeExtension(payload, callback) {
  chrome.runtime.sendMessage(_constants.EXTENSION_ID, { type: 'chromex.dispatch', portName: 'maomao-extension', payload: payload }, function (response) {
    logger.warn('response from extension', response);
    if (callback) {
      callback(response.error, response.value);
    }
  });
}