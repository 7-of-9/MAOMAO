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

var _templateObject = (0, _taggedTemplateLiteral3.default)(['\n  align-items: center;\n  display: flex;\n  float: none;\n  margin-left: 0;\n  margin-right: 0;\n  padding-right: 0;\n  width: auto;\n  flex: 1 1 auto;\n  min-height: 0;\n  min-width: 0;\n  padding: 12px 16px;\n'], ['\n  align-items: center;\n  display: flex;\n  float: none;\n  margin-left: 0;\n  margin-right: 0;\n  padding-right: 0;\n  width: auto;\n  flex: 1 1 auto;\n  min-height: 0;\n  min-width: 0;\n  padding: 12px 16px;\n']);

/**
*
* Header
*
*/

var Wrapper = _styledComponents2.default.div(_templateObject);

function Header(props) {
  return _react2.default.createElement(Wrapper, { className: 'logo' }, ' ', props.children);
}

Header.propTypes = {
  children: _react.PropTypes.node.isRequired
};

exports.default = Header;