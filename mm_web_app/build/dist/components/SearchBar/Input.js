'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.InputContainer = exports.InputWrapper = undefined;

var _taggedTemplateLiteral2 = require('babel-runtime/helpers/taggedTemplateLiteral');

var _taggedTemplateLiteral3 = _interopRequireDefault(_taggedTemplateLiteral2);

var _styledComponents = require('styled-components');

var _styledComponents2 = _interopRequireDefault(_styledComponents);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _templateObject = (0, _taggedTemplateLiteral3.default)(['\n  background-image: url(\'/static/images/search-icon.svg\');\n  background-position: 12px 7px;\n  background-repeat: no-repeat;\n  background-size: 29px 26px;\n  height: 40px;\n  padding-left: 44px;\n  background-color: #efefef;\n  border: none;\n  border-radius: 4px;\n'], ['\n  background-image: url(\'/static/images/search-icon.svg\');\n  background-position: 12px 7px;\n  background-repeat: no-repeat;\n  background-size: 29px 26px;\n  height: 40px;\n  padding-left: 44px;\n  background-color: #efefef;\n  border: none;\n  border-radius: 4px;\n']),
    _templateObject2 = (0, _taggedTemplateLiteral3.default)(['\n  text-align: left;\n  color: rgb(33, 25, 34);\n  height: 40px;\n'], ['\n  text-align: left;\n  color: rgb(33, 25, 34);\n  height: 40px;\n']);

var InputWrapper = _styledComponents2.default.div(_templateObject);

var InputContainer = _styledComponents2.default.div(_templateObject2);

exports.InputWrapper = InputWrapper;
exports.InputContainer = InputContainer;