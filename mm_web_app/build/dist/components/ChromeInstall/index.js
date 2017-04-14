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

var _nealReact = require('neal-react');

var _UnlockNow = require('../../components/UnlockNow');

var _UnlockNow2 = _interopRequireDefault(_UnlockNow);

var _chrome = require('../../utils/chrome');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _templateObject = (0, _taggedTemplateLiteral3.default)(['\n  text-align: center;\n'], ['\n  text-align: center;\n']),
    _templateObject2 = (0, _taggedTemplateLiteral3.default)(['\n margin-left: 40px;\n padding: 0.5em 1em;\n background: #1b7ac5;\n color: #fff;\n'], ['\n margin-left: 40px;\n padding: 0.5em 1em;\n background: #1b7ac5;\n color: #fff;\n']),
    _templateObject3 = (0, _taggedTemplateLiteral3.default)(['\n margin-left: 1px;\n padding: 0.5em 1em;\n background: #1b7ac5;\n color: #fff;\n'], ['\n margin-left: 1px;\n padding: 0.5em 1em;\n background: #1b7ac5;\n color: #fff;\n']);

/**
*
* ChromeInstall
*
*/

var Wrapper = _styledComponents2.default.div(_templateObject);

var AddToChrome = _styledComponents2.default.button(_templateObject2);

var Share = _styledComponents2.default.button(_templateObject3);

function ChromeInstall(_ref) {
  var title = _ref.title,
      install = _ref.install;

  return _react2.default.createElement(Wrapper, { style: { display: (0, _chrome.hasInstalledExtension)() ? 'none' : '' } }, _react2.default.createElement(_nealReact.Hero, { className: 'text-xs-center' }, _react2.default.createElement(_UnlockNow2.default, { install: install, title: title, hasInstalled: (0, _chrome.hasInstalledExtension)() }), _react2.default.createElement(AddToChrome, { onClick: install }, _react2.default.createElement('i', { className: 'fa fa-plus', 'aria-hidden': 'true' }), ' ADD TO CHROME'), _react2.default.createElement(Share, null, _react2.default.createElement('i', { className: 'fa fa-share-alt', 'aria-hidden': 'true' }))), _react2.default.createElement(_nealReact.Section, null, _react2.default.createElement(_nealReact.HorizontalSplit, { padding: 'md' }, _react2.default.createElement('div', null, _react2.default.createElement('p', { className: 'lead' }, 'Batteries Included'), _react2.default.createElement('p', null, 'Neal is based on ', _react2.default.createElement('a', { href: 'http://v4-alpha.getbootstrap.com/', target: '_blank' }, 'Bootstrap 4'), ' and ships with navbar, hero, footer, sections, horizontal split, pricing tables, customer quotes and other components you need for a landing page. No more repetitive coding! Oh, and it\'s easy to extend.')), _react2.default.createElement('div', null, _react2.default.createElement('p', { className: 'lead' }, 'Third-Party Integrations'), _react2.default.createElement('p', null, 'External integrations like &nbsp', _react2.default.createElement('a', { href: 'http://www.google.com/analytics/' }, 'Google Analytics'), ',&nbsp', _react2.default.createElement('a', { href: 'https://segment.com/' }, 'Segment'), ',&nbsp', _react2.default.createElement('a', { href: 'https://stripe.com/' }, 'Stripe'), ' and&nbsp', _react2.default.createElement('a', { href: 'http://typeform.com' }, 'Typeform'), ' are included. No more copying & pasting integration code, all you need is your API keys. We automatically track events when visitors navigate to different parts of your page.')), _react2.default.createElement('div', null, _react2.default.createElement('p', { className: 'lead' }, 'Serverless Deployment'), _react2.default.createElement('p', null, 'Because you are relying on react.js and third-party integration you don\'t need a server to host your landing page. Simply upload it to an Amazon S3 bucket, enable website hosting, and it\'s ready to go!')))));
}

exports.default = ChromeInstall;