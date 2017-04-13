'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _head = require('next/dist/lib/head.js');

var _head2 = _interopRequireDefault(_head);

var _mobxReact = require('mobx-react');

var _loglevel = require('loglevel');

var logger = _interopRequireWildcard(_loglevel);

var _nealReact = require('neal-react');

var _nprogress = require('nprogress');

var _nprogress2 = _interopRequireDefault(_nprogress);

var _index = require('next/dist/lib/router/index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _dec, _class;

/*
 *
 * Home
 *
 */

logger.setLevel('info');
_index2.default.onRouteChangeStart = function (url) {
  logger.info('Loading: ' + url);
  _nprogress2.default.start();
};
_index2.default.onRouteChangeComplete = function () {
  return _nprogress2.default.done();
};
_index2.default.onRouteChangeError = function () {
  return _nprogress2.default.done();
};

var brandName = 'Maomao';
var brand = _react2.default.createElement('span', null, brandName);

var businessAddress = _react2.default.createElement('address', null, _react2.default.createElement('strong', null, brandName), _react2.default.createElement('br', null), 'Singapore', _react2.default.createElement('br', null));

var Home = (_dec = (0, _mobxReact.inject)('store'), _dec(_class = (0, _mobxReact.observer)(_class = function (_React$Component) {
  (0, _inherits3.default)(Home, _React$Component);

  function Home() {
    (0, _classCallCheck3.default)(this, Home);

    return (0, _possibleConstructorReturn3.default)(this, (Home.__proto__ || (0, _getPrototypeOf2.default)(Home)).apply(this, arguments));
  }

  (0, _createClass3.default)(Home, [{
    key: 'componentWillReact',
    value: function componentWillReact() {
      logger.warn('I will re-render, since the todo has changed!');
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      logger.warn('componentDidMount');
    }
  }, {
    key: 'render',
    value: function render() {
      logger.warn('Home', this.props);
      return _react2.default.createElement(_nealReact.Page, null, _react2.default.createElement(_head2.default, null, _react2.default.createElement('title', null, 'Maomao - Home page'), _react2.default.createElement('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }), _react2.default.createElement('link', { rel: 'chrome-webstore-item', href: 'https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk' }), _react2.default.createElement('script', { src: 'https://npmcdn.com/tether@1.2.4/dist/js/tether.min.js' }), _react2.default.createElement('script', { src: 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js' }), _react2.default.createElement('script', { src: 'https://cdn.rawgit.com/twbs/bootstrap/v4-dev/dist/js/bootstrap.js' }), _react2.default.createElement('link', { rel: 'stylesheet', href: 'https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css' }), _react2.default.createElement('link', { rel: 'stylesheet', href: '/static/vendors/css/nprogress.css' })), _react2.default.createElement(_nealReact.Navbar, { brand: brand }), _react2.default.createElement(_nealReact.Hero, { className: 'text-xs-center' }, _react2.default.createElement('p', null, 'Next.js has ', this.props.store.stars, ' \u2B50\uFE0F')), _react2.default.createElement(_nealReact.Section, null, _react2.default.createElement(_nealReact.HorizontalSplit, { padding: 'md' }, _react2.default.createElement('div', null, _react2.default.createElement('p', { className: 'lead' }, 'Batteries Included'), _react2.default.createElement('p', null, 'Neal is based on ', _react2.default.createElement('a', { href: 'http://v4-alpha.getbootstrap.com/', target: '_blank' }, 'Bootstrap 4'), ' and ships with navbar, hero, footer, sections, horizontal split, pricing tables, customer quotes and other components you need for a landing page. No more repetitive coding! Oh, and it\'s easy to extend.')), _react2.default.createElement('div', null, _react2.default.createElement('p', { className: 'lead' }, 'Third-Party Integrations'), _react2.default.createElement('p', null, 'External integrations like \xA0', _react2.default.createElement('a', { href: 'http://www.google.com/analytics/' }, 'Google Analytics'), ',\xA0', _react2.default.createElement('a', { href: 'https://segment.com/' }, 'Segment'), ',\xA0', _react2.default.createElement('a', { href: 'https://stripe.com/' }, 'Stripe'), ' and\xA0', _react2.default.createElement('a', { href: 'http://typeform.com' }, 'Typeform'), ' are included. No more copying & pasting integration code, all you need is your API keys. We automatically track events when visitors navigate to different parts of your page.')), _react2.default.createElement('div', null, _react2.default.createElement('p', { className: 'lead' }, 'Serverless Deployment'), _react2.default.createElement('p', null, 'Because you are relying on react.js and third-party integration you don\'t need a server to host your landing page. Simply upload it to an Amazon S3 bucket, enable website hosting, and it\'s ready to go!')))), _react2.default.createElement(_nealReact.Footer, { brandName: brandName,
        facebookUrl: 'http://www.facebook.com',
        twitterUrl: 'http://www.twitter.com/',
        address: businessAddress
      }));
    }
  }]);

  return Home;
}(_react2.default.Component)) || _class) || _class);

exports.default = Home;