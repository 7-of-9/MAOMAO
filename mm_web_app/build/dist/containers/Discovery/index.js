'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Discovery = undefined;

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

var _nealReact = require('neal-react');

var _mobxReact = require('mobx-react');

var _mobx = require('mobx');

var _reactSticky = require('react-sticky');

var _reactNoSsr = require('react-no-ssr');

var _reactNoSsr2 = _interopRequireDefault(_reactNoSsr);

var _index = require('next/dist/lib/router/index.js');

var _index2 = _interopRequireDefault(_index);

var _link = require('next/dist/lib/link.js');

var _link2 = _interopRequireDefault(_link);

var _reactInfiniteScroller = require('react-infinite-scroller');

var _reactInfiniteScroller2 = _interopRequireDefault(_reactInfiniteScroller);

var _nprogress = require('nprogress');

var _nprogress2 = _interopRequireDefault(_nprogress);

var _loglevel = require('loglevel');

var logger = _interopRequireWildcard(_loglevel);

var _constants = require('../../containers/App/constants');

var _Loading = require('../../components/Loading');

var _Loading2 = _interopRequireDefault(_Loading);

var _Header = require('../../components/Header');

var _Header2 = _interopRequireDefault(_Header);

var _SearchBar = require('../../components/SearchBar');

var _SearchBar2 = _interopRequireDefault(_SearchBar);

var _LogoIcon = require('../../components/LogoIcon');

var _LogoIcon2 = _interopRequireDefault(_LogoIcon);

var _Slogan = require('../../components/Slogan');

var _Slogan2 = _interopRequireDefault(_Slogan);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _dec, _class;
// import Block from '../../components/Block'


var SRRLoading = function SRRLoading() {
  return _react2.default.createElement('div', null, 'Loading...');
};

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

var brandName = 'MaoMao';
var brand = _react2.default.createElement(_Header2.default, null, _react2.default.createElement(_LogoIcon2.default, null), _react2.default.createElement(_Slogan2.default, null));
var businessAddress = _react2.default.createElement('address', null, _react2.default.createElement('strong', null, brandName), _react2.default.createElement('br', null), 'Singapore', _react2.default.createElement('br', null));

var Discovery = exports.Discovery = (_dec = (0, _mobxReact.inject)('store'), _dec(_class = (0, _mobxReact.observer)(_class = function (_React$Component) {
  (0, _inherits3.default)(Discovery, _React$Component);

  function Discovery(props) {
    (0, _classCallCheck3.default)(this, Discovery);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Discovery.__proto__ || (0, _getPrototypeOf2.default)(Discovery)).call(this, props));

    _this.state = {
      loading: false
    };
    _this.loadMore = _this.loadMore.bind(_this);
    _this.onChange = _this.onChange.bind(_this);
    _this.onSearch = _this.onSearch.bind(_this);
    logger.warn('Discovery', _this.props);
    return _this;
  }

  (0, _createClass3.default)(Discovery, [{
    key: 'loadMore',
    value: function loadMore() {}
  }, {
    key: 'onChange',
    value: function onChange(terms) {
      this.props.store.changeTerms(terms);
    }
  }, {
    key: 'onSearch',
    value: function onSearch(evt) {
      if (evt !== undefined && evt.preventDefault) {
        evt.preventDefault();
      }
      this.props.store.search(1);
    }
  }, {
    key: 'render',
    value: function render() {
      var title = 'MaoMao - Discovery page';
      var description = 'Maomao is a peer-to-peer real time content sharing network, powered by a deep learning engine.';
      var elements = [];
      var terms = (0, _mobx.toJS)(this.props.store.terms);
      logger.warn('terms', terms);
      return _react2.default.createElement(_nealReact.Page, null, _react2.default.createElement(_head2.default, null, _react2.default.createElement('meta', { charSet: 'utf-8' }), _react2.default.createElement('title', null, title), _react2.default.createElement('meta', { name: 'description', content: description }), _react2.default.createElement('meta', { name: 'og:title', content: title }), _react2.default.createElement('meta', { name: 'og:description', content: description }), _react2.default.createElement('meta', { name: 'og:image', content: _constants.MAOMAO_SITE_URL + 'static/images/logo.png' }), _react2.default.createElement('meta', { name: 'fb:app_id', content: _constants.FACEBOOK_APP_ID }), _react2.default.createElement('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1, shrink-to-fit=no' }), _react2.default.createElement('link', { rel: 'chrome-webstore-item', href: 'https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk' }), _react2.default.createElement('script', { src: 'https://code.jquery.com/jquery-3.1.1.slim.min.js' }), _react2.default.createElement('script', { src: 'https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js' }), _react2.default.createElement('script', { src: 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js' }), _react2.default.createElement('link', { rel: 'stylesheet', href: 'https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css' }), _react2.default.createElement('link', { rel: 'stylesheet', href: '/static/vendors/css/nprogress.css' })), _react2.default.createElement(_nealReact.Navbar, { brand: brand }, _react2.default.createElement(_nealReact.NavItem, null, _react2.default.createElement(_link2.default, { prefetch: true, href: '/', className: 'nav-link' }, 'Home')), _react2.default.createElement(_nealReact.NavItem, null, _react2.default.createElement(_link2.default, { href: '/discovery', className: 'nav-link' }, 'Discovery')), _react2.default.createElement(_nealReact.NavItem, null, _react2.default.createElement(_link2.default, { prefetch: true, href: '/hiring', className: 'nav-link' }, 'Hiring'))), _react2.default.createElement(_reactSticky.StickyContainer, { className: 'container-fluid' }, _react2.default.createElement(_reactSticky.Sticky, null, _react2.default.createElement(_SearchBar2.default, { terms: terms, onChange: this.onChange, onSearch: this.onSearch })), elements.length > 0 && _react2.default.createElement(_reactNoSsr2.default, { onSSR: _react2.default.createElement(SRRLoading, null) }, _react2.default.createElement(_reactInfiniteScroller2.default, {
        loadMore: this.loadMore,
        hasMore: this.state.loading,
        threshold: 200
      }, elements)), _react2.default.createElement(_Loading2.default, { isLoading: this.state.loading })), _react2.default.createElement(_nealReact.Footer, { brandName: brandName,
        facebookUrl: 'http://www.facebook.com',
        twitterUrl: 'http://www.twitter.com/',
        address: businessAddress
      }));
    }
  }]);

  return Discovery;
}(_react2.default.Component)) || _class) || _class);

exports.default = Discovery;