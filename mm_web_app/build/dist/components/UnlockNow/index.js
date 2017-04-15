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

var _templateObject = (0, _taggedTemplateLiteral3.default)(['\n  padding: 0.5em;\n  background: #0b9803;\n  width: 124px;\n  color: #fff;\n'], ['\n  padding: 0.5em;\n  background: #0b9803;\n  width: 124px;\n  color: #fff;\n']);

/**
*
* UnlockNow
*
*/

var Button = _styledComponents2.default.button(_templateObject);

function UnlockNow(_ref) {
  var title = _ref.title,
      install = _ref.install;

  return _react2.default.createElement(Button, { onClick: install }, title, ' ');
}

exports.default = UnlockNow;