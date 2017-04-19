'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasInstalledExtension = hasInstalledExtension;
exports.sendMsgToChromeExtension = sendMsgToChromeExtension;
exports.actionCreator = actionCreator;

var _loglevel = require('loglevel');

var logger = _interopRequireWildcard(_loglevel);

var _constants = require('../containers/App/constants');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/* global chrome */
function hasInstalledExtension() {
  return document.getElementById('maomao-extension-anchor') !== null || chrome && chrome.app && chrome.app.isInstalled;
}

function sendMsgToChromeExtension(payload) {
  var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

  if (chrome) {
    chrome.runtime.sendMessage(_constants.EXTENSION_ID, { type: 'chromex.dispatch', portName: 'maomao-extension', payload: payload }, function (response) {
      logger.warn('response from extension', payload, response);
      if (callback) {
        callback(response.error, response.value);
      }
    });
  } else {
    logger.warn('ONLY SUPPORT CHROME');
  }
}

function actionCreator(type, payload) {
  return {
    type: type,
    payload: payload
  };
}