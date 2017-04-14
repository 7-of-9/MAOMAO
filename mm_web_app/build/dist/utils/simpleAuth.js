'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.login = login;
exports.logout = logout;
exports.userId = userId;
exports.userEmail = userEmail;
exports.userHash = userHash;

var _localforage = require('localforage');

var localStorage = _interopRequireWildcard(_localforage);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var USER_ID = 'userId';
var USER_EMAIL = 'email';
var USER_HASH = 'hash';

/**
 * Login and run the callback
 * @param  number   user id
 * @param  string   user id
 * @param  function cb
 */
function login(id, email, hash, cb) {
  localStorage.setItem(USER_ID, id);
  localStorage.setItem(USER_EMAIL, email);
  localStorage.setItem(USER_HASH, hash);
  if (cb) {
    cb();
  }
}

/**
 * Logout and clear user information
 * @param  function cb
 */
function logout(cb) {
  localStorage.setItem(USER_ID, -1);
  localStorage.setItem(USER_EMAIL, '');
  localStorage.setItem(USER_HASH, '');
  if (cb) {
    cb();
  }
}

/**
 * Get user id from local storeage
 * @return number
 */
function userId() {
  return localStorage.getItem(USER_ID);
}

/**
 * Get user email
 * @return string
 */
function userEmail() {
  return localStorage.getItem(USER_EMAIL);
}

/**
 * Get user email
 * @return string
 */
function userHash() {
  return localStorage.getItem(USER_HASH) || '';
}