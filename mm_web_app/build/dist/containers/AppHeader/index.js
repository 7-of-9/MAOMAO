'use strict';

/*
 *
 * AppHeader
 *
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactGoogleLogin = require('react-google-login');

var _reactGoogleLogin2 = _interopRequireDefault(_reactGoogleLogin);

var _reactFacebookLogin = require('react-facebook-login');

var _reactFacebookLogin2 = _interopRequireDefault(_reactFacebookLogin);

var _nealReact = require('neal-react');

var _Logout = require('../../components/Logout');

var _Logout2 = _interopRequireDefault(_Logout);

var _constants = require('../../containers/App/constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function AppHeader(_ref) {
  var isLogin = _ref.isLogin,
      onGoogleSuccess = _ref.onGoogleSuccess,
      onGoogleFailure = _ref.onGoogleFailure,
      onLogout = _ref.onLogout,
      responseFacebook = _ref.responseFacebook;

  return _react2.default.createElement(_nealReact.NavItem, null, !isLogin && _react2.default.createElement(_reactGoogleLogin2.default, {
    clientId: _constants.GOOGLE_CLIENT_ID,
    buttonText: 'LOGIN WITH GOOGLE',
    onSuccess: onGoogleSuccess,
    onFailure: onGoogleFailure
  }), !isLogin && _react2.default.createElement(_reactFacebookLogin2.default, {
    appId: _constants.FACEBOOK_APP_ID,
    autoLoad: false,
    size: 'medium',
    fields: 'name,email,picture',
    callback: responseFacebook
  }), isLogin && _react2.default.createElement(_Logout2.default, { onLogout: onLogout }));
}exports.default = AppHeader;