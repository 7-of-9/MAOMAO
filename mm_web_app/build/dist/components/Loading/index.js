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

var _templateObject = (0, _taggedTemplateLiteral3.default)(['\n  text-align: center;\n  margin: 0 auto;\n'], ['\n  text-align: center;\n  margin: 0 auto;\n']);

/**
*
* Loading
*
*/

var Wrapper = _styledComponents2.default.div(_templateObject);
function Loading(props) {
  return _react2.default.createElement(Wrapper, { style: { display: props.isLoading ? '' : 'none' } }, _react2.default.createElement('img', { alt: 'Loading', src: '/static/images/loading.svg' }));
}

exports.default = Loading;