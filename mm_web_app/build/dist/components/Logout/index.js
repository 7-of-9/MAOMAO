'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _taggedTemplateLiteral2 = require('babel-runtime/helpers/taggedTemplateLiteral');

var _taggedTemplateLiteral3 = _interopRequireDefault(_taggedTemplateLiteral2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _styledComponents = require('styled-components');

var _styledComponents2 = _interopRequireDefault(_styledComponents);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _templateObject = (0, _taggedTemplateLiteral3.default)(['\n  padding: 0.5em\n  width: 130px\n  background-color: #009688\n  color: #fff\n  border-radius: 2px\n  border: 2px solid #000\n'], ['\n  padding: 0.5em\n  width: 130px\n  background-color: #009688\n  color: #fff\n  border-radius: 2px\n  border: 2px solid #000\n']);

/**
*
* Logout
*
*/

var Button = _styledComponents2.default.button(_templateObject);

function Logout(_ref) {
  var onLogout = _ref.onLogout;

  return _react2.default.createElement(Button, { onClick: onLogout }, 'Logout');
}

exports.default = Logout;