'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getShareInfo = getShareInfo;
exports.acceptInvite = acceptInvite;

var _mobxUtils = require('mobx-utils');

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _constants = require('../containers/App/constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getShareInfo(code) {
  return (0, _mobxUtils.fromPromise)(_axios2.default.get(_constants.MAOMAO_API_URL + 'share/info?share_code=' + code));
}

function acceptInvite(id, hash, code) {
  var apiUrl = _constants.MAOMAO_API_URL + 'share/accept?user_id=' + id + '&hash=' + hash + '&share_code=' + code;
  return (0, _mobxUtils.fromPromise)(_axios2.default.get(apiUrl));
}