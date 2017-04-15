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

var _loglevel = require('loglevel');

var logger = _interopRequireWildcard(_loglevel);

var _UnlockNow = require('../../components/UnlockNow');

var _UnlockNow2 = _interopRequireDefault(_UnlockNow);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
      description = _ref.description,
      install = _ref.install,
      isInstall = _ref.isInstall,
      isLogin = _ref.isLogin;

  logger.warn('ChromeInstall isInstall, isLogin', isInstall, isLogin);
  return _react2.default.createElement(Wrapper, null, _react2.default.createElement(_nealReact.Hero, { className: 'text-xs-center' }, _react2.default.createElement('h1', null, description), !isInstall && _react2.default.createElement(_UnlockNow2.default, { install: install, title: title }), !isInstall && _react2.default.createElement(AddToChrome, { onClick: install }, _react2.default.createElement('i', { className: 'fa fa-plus', 'aria-hidden': 'true' }), ' ADD TO CHROME'), !isInstall && _react2.default.createElement(Share, null, _react2.default.createElement('i', { className: 'fa fa-share-alt', 'aria-hidden': 'true' }))), _react2.default.createElement(_nealReact.Section, null, _react2.default.createElement(_nealReact.HorizontalSplit, { padding: 'md' }, _react2.default.createElement('div', null, _react2.default.createElement('p', { className: 'lead' }, 'What is Maomao?'), _react2.default.createElement('p', null, 'Maomao is a solution for friends to automatically share content with each other on a specific topic of shared interest.'), _react2.default.createElement('p', null, 'For example, I might share ', _react2.default.createElement('strong', null, 'US Politics'), ' and ', _react2.default.createElement('strong', null, 'Global Tech > Startups'), ' with one work colleague, ', _react2.default.createElement('strong', null, 'Software > Agile'), ' and ', _react2.default.createElement('strong', null, 'Music > Kpop'), ' with a different work colleague; ', _react2.default.createElement('strong', null, 'Medical Music > Classical Music'), ' with an elderly parent. The permutations are uniquely personalised between peers in the Maomao social graph.'), _react2.default.createElement('p', null, 'Maomao overcomes distance and communication barriers: it amplifies enjoyment and consumption of high quality web content, using AI to let friends rediscover and enjoy content from each other in real time, no matter where they are and ', _react2.default.createElement('strong', null, 'without any effort or input'), ' from each other.'), _react2.default.createElement('p', null, 'It\u2019s a radical reimagining of what sharing can be, always in the complete control of users: it\u2019s safe, automatic and intelligent, highlighting only the best and most relevant content to friends.'), _react2.default.createElement('p', null, 'Because Maomao learns intimately each user\u2019s unique preferences and likes, it also surfaces new and contextually related parts of the internet for users. It\u2019s like a smart, ', _react2.default.createElement('strong', null, 'personalised and proactive search engine.'))), _react2.default.createElement('div', null, _react2.default.createElement('p', { className: 'lead' }, 'How does it work?'), _react2.default.createElement('p', null, 'We use natural language processing, correlation analysis and a real time learning engine to categorise web content as it is browsed. We suggest and then setup real time topic sharing between users on the platform, so users can view each others topic streams - both past and future content is automatically shared once both users accept the shared stream.')))), _react2.default.createElement(_nealReact.Section, null, _react2.default.createElement(_nealReact.HorizontalSplit, { padding: 'md' }, _react2.default.createElement('div', null, _react2.default.createElement('p', { className: 'lead' }, 'What stage are we at?'), _react2.default.createElement('p', null, 'We are in stealth mode, and developing towards private alpha testing phase. We have and end-to-end technical proof of concept in place, working on desktop web.')), _react2.default.createElement('div', null, _react2.default.createElement('p', { className: 'lead' }, 'Who are we??'), _react2.default.createElement('p', null, 'Maomao is founded by a lifelong technologist with twenty years experience: from global tech and finance giants through to most recently an fin-tech startup that attracted several rounds of tier-one Silicon Valley VC investment. Our distributed development team is in APAC region.')))));
}

exports.default = ChromeInstall;