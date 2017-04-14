'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _head = require('next/dist/lib/head.js');

var _head2 = _interopRequireDefault(_head);

var _mobxReact = require('mobx-react');

var _Discovery = require('../containers/Discovery');

var _Discovery2 = _interopRequireDefault(_Discovery);

var _discovery = require('../stores/discovery');

var _index = require('../styles/index.scss');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DiscoveryPage = function (_React$Component) {
  (0, _inherits3.default)(DiscoveryPage, _React$Component);

  (0, _createClass3.default)(DiscoveryPage, null, [{
    key: 'getInitialProps',
    value: function getInitialProps(_ref) {
      var req = _ref.req;

      var isServer = !!req;
      var store = (0, _discovery.initStore)(isServer);
      return { isServer: isServer, store: store };
    }
  }]);

  function DiscoveryPage(props) {
    (0, _classCallCheck3.default)(this, DiscoveryPage);

    var _this = (0, _possibleConstructorReturn3.default)(this, (DiscoveryPage.__proto__ || (0, _getPrototypeOf2.default)(DiscoveryPage)).call(this, props));

    _this.store = (0, _discovery.initStore)(props.isServer);
    return _this;
  }

  (0, _createClass3.default)(DiscoveryPage, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(_mobxReact.Provider, { store: this.store }, _react2.default.createElement('div', null, _react2.default.createElement(_head2.default, null, _react2.default.createElement('title', null, 'Maomao - Discovery page'), _react2.default.createElement('style', { dangerouslySetInnerHTML: { __html: _index2.default } }), _react2.default.createElement('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }), _react2.default.createElement('link', { rel: 'apple-touch-icon', sizes: '57x57', href: '/static/favicon/apple-icon-57x57.png' }), _react2.default.createElement('link', { rel: 'apple-touch-icon', sizes: '60x60', href: '/static/favicon/apple-icon-60x60.png' }), _react2.default.createElement('link', { rel: 'apple-touch-icon', sizes: '72x72', href: '/static/favicon/apple-icon-72x72.png' }), _react2.default.createElement('link', { rel: 'apple-touch-icon', sizes: '76x76', href: '/static/favicon/apple-icon-76x76.png' }), _react2.default.createElement('link', { rel: 'apple-touch-icon', sizes: '114x114', href: '/static/favicon/apple-icon-114x114.png' }), _react2.default.createElement('link', { rel: 'apple-touch-icon', sizes: '120x120', href: '/static/favicon/apple-icon-120x120.png' }), _react2.default.createElement('link', { rel: 'apple-touch-icon', sizes: '144x144', href: '/static/favicon/apple-icon-144x144.png' }), _react2.default.createElement('link', { rel: 'apple-touch-icon', sizes: '152x152', href: '/static/favicon/apple-icon-152x152.png' }), _react2.default.createElement('link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/static/favicon/apple-icon-180x180.png' }), _react2.default.createElement('link', { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/static/favicon/android-icon-192x192.png' }), _react2.default.createElement('link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/static/favicon/favicon-32x32.png' }), _react2.default.createElement('link', { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/static/favicon/favicon-96x96.png' }), _react2.default.createElement('link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/static/favicon/favicon-16x16.png' }), _react2.default.createElement('link', { rel: 'manifest', href: '/static/favicon/manifest.json' }), _react2.default.createElement('meta', { name: 'msapplication-TileColor', content: '#ffffff' }), _react2.default.createElement('meta', { name: 'msapplication-TileImage', content: '/static/favicon/ms-icon-144x144.png' }), _react2.default.createElement('meta', { name: 'theme-color', content: '#ffffff' }), _react2.default.createElement('link', { rel: 'chrome-webstore-item', href: 'https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk' }), _react2.default.createElement('link', { rel: 'stylesheet', href: '//cdnjs.cloudflare.com/ajax/libs/bricklayer/0.3.2/bricklayer.min.css' })), _react2.default.createElement(_Discovery2.default, null)));
    }
  }]);

  return DiscoveryPage;
}(_react2.default.Component);

exports.default = DiscoveryPage;