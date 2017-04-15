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

var _index = require('next/dist/lib/router/index.js');

var _index2 = _interopRequireDefault(_index);

var _link = require('next/dist/lib/link.js');

var _link2 = _interopRequireDefault(_link);

var _mobxReact = require('mobx-react');

var _reactNoSsr = require('react-no-ssr');

var _reactNoSsr2 = _interopRequireDefault(_reactNoSsr);

var _reactNotification = require('react-notification');

var _immutable = require('immutable');

var _loglevel = require('loglevel');

var logger = _interopRequireWildcard(_loglevel);

var _nealReact = require('neal-react');

var _nprogress = require('nprogress');

var _nprogress2 = _interopRequireDefault(_nprogress);

var _constants = require('../../containers/App/constants');

var _AppHeader = require('../../containers/AppHeader');

var _AppHeader2 = _interopRequireDefault(_AppHeader);

var _Header = require('../../components/Header');

var _Header2 = _interopRequireDefault(_Header);

var _LogoIcon = require('../../components/LogoIcon');

var _LogoIcon2 = _interopRequireDefault(_LogoIcon);

var _Slogan = require('../../components/Slogan');

var _Slogan2 = _interopRequireDefault(_Slogan);

var _ChromeInstall = require('../../components/ChromeInstall');

var _ChromeInstall2 = _interopRequireDefault(_ChromeInstall);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _dec, _class;

/*
 *
 * Home
 *
 */

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

var Home = (_dec = (0, _mobxReact.inject)('store'), _dec(_class = (0, _mobxReact.observer)(_class = function (_React$Component) {
  (0, _inherits3.default)(Home, _React$Component);

  function Home(props) {
    (0, _classCallCheck3.default)(this, Home);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Home.__proto__ || (0, _getPrototypeOf2.default)(Home)).call(this, props));

    _this.state = {
      notifications: (0, _immutable.OrderedSet)(),
      count: 0
    };
    _this.onInstallSucess = _this.onInstallSucess.bind(_this);
    _this.onInstallFail = _this.onInstallFail.bind(_this);
    _this.inlineInstall = _this.inlineInstall.bind(_this);
    _this.addNotification = _this.addNotification.bind(_this);
    _this.removeNotification = _this.removeNotification.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(Home, [{
    key: 'onInstallSucess',
    value: function onInstallSucess() {
      var _this2 = this;

      this.addNotification('Yeah! You have been installed maomao extension successfully.');
      setTimeout(function () {
        if (_this2.props.store.shareCode) {
          _index2.default.push('/' + _this2.props.store.shareCode);
        } else {
          _index2.default.push('/');
        }
      }, 1000);
    }
  }, {
    key: 'onInstallFail',
    value: function onInstallFail(error) {
      this.addNotification(error);
    }
  }, {
    key: 'addNotification',
    value: function addNotification(msg) {
      var _this3 = this;

      var uuid = Date.now();
      return this.setState({
        notifications: this.state.notifications.add({
          message: msg,
          key: uuid,
          action: 'Dismiss',
          onClick: function onClick(deactivate) {
            _this3.removeNotification(deactivate.key);
          }
        })
      });
    }
  }, {
    key: 'inlineInstall',
    value: function inlineInstall() {
      /* global chrome */
      chrome.webstore.install('https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk', this.onInstallSucess, this.onInstallFail);
    }
  }, {
    key: 'removeNotification',
    value: function removeNotification(uuid) {
      var notifications = this.state.notifications.filter(function (item) {
        return item.key !== uuid;
      });
      this.setState({
        notifications: notifications
      });
    }
  }, {
    key: 'componentWillReact',
    value: function componentWillReact() {
      logger.warn('I will re-render, since the data has changed!');
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      logger.warn('componentDidMount', this.props);
      if (this.props.isClosePopup) {
        logger.warn('Close popup');
        window.close();
      }
      this.props.store.checkAuth();
      this.props.store.checkInstall();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      var title = 'MaoMao - Home page';
      var description = 'Maomao is a peer-to-peer real time content sharing network, powered by a deep learning engine.';
      if (this.props.store.shareInfo) {
        var _props$store$shareInf = this.props.store.shareInfo,
            fullname = _props$store$shareInf.fullname,
            shareAll = _props$store$shareInf.share_all,
            topicTitle = _props$store$shareInf.topic_title,
            urlTitle = _props$store$shareInf.url_title;

        if (shareAll) {
          description = fullname + ' would like to share all MaoMao stream with you';
        } else if (urlTitle && urlTitle.length) {
          description = fullname + ' would like to share "' + urlTitle + '" with you';
        } else if (topicTitle && topicTitle.length) {
          description = fullname + ' would like to share the MaoMao stream with you: "' + topicTitle + '"';
        }
      }
      return _react2.default.createElement(_nealReact.Page, { style: { display: this.props.isClosePopup ? 'none' : '' } }, _react2.default.createElement(_head2.default, null, _react2.default.createElement('meta', { charSet: 'utf-8' }), _react2.default.createElement('title', null, title), _react2.default.createElement('meta', { name: 'description', content: description }), _react2.default.createElement('meta', { name: 'og:title', content: title }), _react2.default.createElement('meta', { name: 'og:description', content: description }), _react2.default.createElement('meta', { name: 'og:image', content: _constants.MAOMAO_SITE_URL + 'static/images/logo.png' }), _react2.default.createElement('meta', { name: 'fb:app_id', content: _constants.FACEBOOK_APP_ID }), _react2.default.createElement('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }), _react2.default.createElement('link', { rel: 'chrome-webstore-item', href: 'https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk' }), _react2.default.createElement('script', { src: 'https://code.jquery.com/jquery-3.1.1.slim.min.js' }), _react2.default.createElement('script', { src: 'https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js' }), _react2.default.createElement('script', { src: 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js' }), _react2.default.createElement('link', { rel: 'stylesheet', href: 'https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css' }), _react2.default.createElement('link', { rel: 'stylesheet', href: '/static/vendors/css/nprogress.css' })), _react2.default.createElement(_nealReact.Navbar, { brand: brand }, _react2.default.createElement(_nealReact.NavItem, null, _react2.default.createElement(_link2.default, { href: '/', className: 'nav-link' }, 'Home')), _react2.default.createElement(_nealReact.NavItem, null, _react2.default.createElement(_link2.default, { prefetch: true, href: '/discovery', className: 'nav-link' }, 'Discovery')), _react2.default.createElement(_nealReact.NavItem, null, _react2.default.createElement(_link2.default, { prefetch: true, href: '/hiring', className: 'nav-link' }, 'Hiring'))), _react2.default.createElement(_reactNoSsr2.default, null, this.props.store.isInstall && _react2.default.createElement(_AppHeader2.default, { isLogin: this.props.store.isLogin })), _react2.default.createElement(_reactNotification.NotificationStack, {
        notifications: this.state.notifications.toArray(),
        dismissAfter: 5000,
        onDismiss: function onDismiss(notification) {
          return _this4.setState({
            notifications: _this4.state.notifications.delete(notification)
          });
        }
      }), _react2.default.createElement(_reactNoSsr2.default, null, _react2.default.createElement(_ChromeInstall2.default, { title: 'Unlock Now', install: this.inlineInstall })), _react2.default.createElement(_nealReact.Footer, { brandName: brandName,
        facebookUrl: 'http://www.facebook.com',
        twitterUrl: 'http://www.twitter.com/',
        address: businessAddress
      }));
    }
  }]);

  return Home;
}(_react2.default.Component)) || _class) || _class);

exports.default = Home;