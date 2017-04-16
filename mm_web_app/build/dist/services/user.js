'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loginWithGoogle = loginWithGoogle;
exports.loginWithFacebook = loginWithFacebook;
exports.getUserHistory = getUserHistory;

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _mobxUtils = require('mobx-utils');

var _constants = require('../containers/App/constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function loginWithGoogle(info) {
  var user = {
    email: info.profileObj.email,
    firstName: info.profileObj.familyName,
    lastName: info.profileObj.givenName,
    avatar: info.profileObj.imageUrl,
    google_user_id: info.googleId
  };
  var apiUrl = _constants.MAOMAO_API_URL + 'user/google';

  return (0, _mobxUtils.fromPromise)((0, _axios2.default)({
    method: 'post',
    url: apiUrl,
    headers: {
      'Content-Type': 'application/json'
    },
    data: user
  }));
}

function loginWithFacebook(info) {
  var names = info.name.split(' ');
  var firstName = names[0];
  var lastName = names.slice(1, names.length).join(' ');

  var user = {
    email: info.email,
    firstName: firstName,
    lastName: lastName,
    avatar: info.picture.data.url,
    fb_user_id: info.userID
  };
  var apiUrl = _constants.MAOMAO_API_URL + 'user/fb';
  return (0, _mobxUtils.fromPromise)((0, _axios2.default)({
    method: 'post',
    url: apiUrl,
    headers: {
      'Content-Type': 'application/json'
    },
    data: user
  }));
}

function getUserHistory(id, hash) {
  var apiUrl = _constants.MAOMAO_API_URL + 'user/streams?user_id=' + id + '&hash=' + hash;
  return (0, _mobxUtils.fromPromise)(_axios2.default.get(apiUrl));
}