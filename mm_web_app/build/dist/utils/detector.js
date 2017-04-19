'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isMobileBrowser = isMobileBrowser;
exports.isChromeBrowser = isChromeBrowser;

var _mobileDetect = require('mobile-detect');

var _mobileDetect2 = _interopRequireDefault(_mobileDetect);

var _loglevel = require('loglevel');

var logger = _interopRequireWildcard(_loglevel);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isMobileBrowser(userAgent) {
  var md = new _mobileDetect2.default(userAgent);
  logger.info('isMobileBrowser', userAgent, md);
  return !!md.mobile();
}

function isChromeBrowser() {
  logger.info('isChromeBrowser', !!window.chrome && !!window.chrome.webstore);
  return !!window.chrome && !!window.chrome.webstore;
}