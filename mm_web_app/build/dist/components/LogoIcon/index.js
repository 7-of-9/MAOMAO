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

var _templateObject = (0, _taggedTemplateLiteral3.default)(['\n  background-image: url(\'/static/images/logo.png\');\n  background-repeat: no-repeat;\n  height: 40px;\n  width: 40px;\n  background-size: 40px 40px;\n  margin-left: 16px;\n  margin-right: 16px;\n'], ['\n  background-image: url(\'/static/images/logo.png\');\n  background-repeat: no-repeat;\n  height: 40px;\n  width: 40px;\n  background-size: 40px 40px;\n  margin-left: 16px;\n  margin-right: 16px;\n']);

/**
*
* LogoIcon
*
*/

var Wrapper = _styledComponents2.default.div(_templateObject);

function LogoIcon() {
  return _react2.default.createElement(Wrapper, null);
}

LogoIcon.propTypes = {};

exports.default = LogoIcon;