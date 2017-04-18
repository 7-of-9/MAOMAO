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

var _templateObject = (0, _taggedTemplateLiteral3.default)(['\n  background-image: url(\'/static/images/demo.png\');\n  background-repeat: no-repeat;\n  background-size: 40px 40px;\n  margin-left: 16px;\n  margin-right: 16px;\n'], ['\n  background-image: url(\'/static/images/demo.png\');\n  background-repeat: no-repeat;\n  background-size: 40px 40px;\n  margin-left: 16px;\n  margin-right: 16px;\n']),
    _templateObject2 = (0, _taggedTemplateLiteral3.default)(['\n  margin-left: 0px;\n  margin-top: 30px;\n  float: left;\n  &:hover {\n    cursor: pointer;\n  }\n'], ['\n  margin-left: 0px;\n  margin-top: 30px;\n  float: left;\n  &:hover {\n    cursor: pointer;\n  }\n']),
    _templateObject3 = (0, _taggedTemplateLiteral3.default)(['\n  margin-left: 10px;\n  margin-top: 30px;\n  float: right;\n  color: #c0c0c0;\n'], ['\n  margin-left: 10px;\n  margin-top: 30px;\n  float: right;\n  color: #c0c0c0;\n']);

/**
*
* Slogan
*
*/

var Wrapper = _styledComponents2.default.div(_templateObject);

var MaomaoImage = _styledComponents2.default.img(_templateObject2);

var Description = _styledComponents2.default.p(_templateObject3);

function Slogan() {
  return _react2.default.createElement(Wrapper, null, _react2.default.createElement(MaomaoImage, {
    onClick: function onClick() {
      window.location.href = '/';
    }, src: '/static/images/maomao.png'
  }), _react2.default.createElement(Description, null, ' get smarter '));
}

exports.default = Slogan;