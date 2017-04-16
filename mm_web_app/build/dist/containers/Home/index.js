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

var _reactTabs = require('react-tabs');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _loglevel = require('loglevel');

var logger = _interopRequireWildcard(_loglevel);

var _nealReact = require('neal-react');

var _nprogress = require('nprogress');

var _nprogress2 = _interopRequireDefault(_nprogress);

var _constants = require('../../containers/App/constants');

var _AppHeader = require('../../containers/AppHeader');

var _AppHeader2 = _interopRequireDefault(_AppHeader);

var _ChromeInstall = require('../../containers/ChromeInstall');

var _ChromeInstall2 = _interopRequireDefault(_ChromeInstall);

var _Loading = require('../../components/Loading');

var _Loading2 = _interopRequireDefault(_Loading);

var _Header = require('../../components/Header');

var _Header2 = _interopRequireDefault(_Header);

var _LogoIcon = require('../../components/LogoIcon');

var _LogoIcon2 = _interopRequireDefault(_LogoIcon);

var _Slogan = require('../../components/Slogan');

var _Slogan2 = _interopRequireDefault(_Slogan);

var _YourStreams = require('../../components/YourStreams');

var _YourStreams2 = _interopRequireDefault(_YourStreams);

var _FriendStreams = require('../../components/FriendStreams');

var _FriendStreams2 = _interopRequireDefault(_FriendStreams);

var _StreamList = require('../../components/StreamList');

var _StreamList2 = _interopRequireDefault(_StreamList);

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
    _this.handleSelect = _this.handleSelect.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(Home, [{
    key: 'handleSelect',
    value: function handleSelect(index, last) {
      logger.warn('Selected tab: ' + index + ', Last tab: ' + last);
    }
  }, {
    key: 'onInstallSucess',
    value: function onInstallSucess() {
      this.addNotification('Yeah! You have been installed maomao extension successfully.');
      setTimeout(function () {
        window.location.reload();
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
      var _this2 = this;

      var uuid = Date.now();
      return this.setState({
        notifications: this.state.notifications.add({
          message: msg,
          key: uuid,
          action: 'Dismiss',
          onClick: function onClick(deactivate) {
            _this2.removeNotification(deactivate.key);
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
      logger.warn('Home Component will re-render, since the data has changed!', this.props.store);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this3 = this;

      logger.warn('componentDidMount', this.props);
      if (this.props.isClosePopup) {
        logger.warn('Close popup');
        window.close();
      }
      setTimeout(function () {
        _this3.props.store.checkInstallAndAuth();
      }, 100);
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
      var selectedMyStreamUrls = [];
      var selectedFriendStreamUrls = [];
      var sortedTopicByUrls = [];
      var friends = [];
      var currentTermId = this.props.store.currentTermId;
      var friendStreamId = this.props.store.friendStreamId;
      if (this.props.store.userHistory) {
        var _props$store$userHist = this.props.store.userHistory,
            _props$store$userHist2 = _props$store$userHist.me,
            urls = _props$store$userHist2.urls,
            topics = _props$store$userHist2.topics,
            shares = _props$store$userHist.shares;

        friends = shares.slice();
        logger.warn('friends', friends);
        sortedTopicByUrls = _lodash2.default.reverse(_lodash2.default.sortBy(_lodash2.default.filter(topics, function (topic) {
          return topic && topic.term_id > 0;
        }), [function (topic) {
          return topic.url_ids.length;
        }]));
        var urlIds = [];
        // first for my stream
        if (currentTermId === -1 && sortedTopicByUrls.length > 0) {
          urlIds = sortedTopicByUrls[0].url_ids;
          currentTermId = sortedTopicByUrls[0].term_id;
        } else {
          var currentTopic = sortedTopicByUrls.find(function (item) {
            return item.term_id === currentTermId;
          });
          if (currentTopic) {
            urlIds = currentTopic.url_ids;
          }
          logger.warn('currentTopic', currentTopic);
        }

        selectedMyStreamUrls = _lodash2.default.filter(urls, function (item) {
          return item.id && urlIds.indexOf(item.id) !== -1;
        });
        if (friendStreamId === -1 && friends.length) {
          friendStreamId = friends[0].user_id;
          logger.warn('found friendStreamId', friendStreamId);
        }
        var currentStream = friends.find(function (item) {
          return item && item.user_id === friendStreamId;
        });
        logger.warn('currentStream', currentStream);
        if (currentStream) {
          var list = currentStream.list.slice();
          logger.warn('list', list);
          selectedFriendStreamUrls = _lodash2.default.uniq(list.map(function (item) {
            return item && item.urls;
          }));
          logger.warn('selectedFriendStreamUrls', selectedFriendStreamUrls);
          selectedFriendStreamUrls = selectedFriendStreamUrls[0].slice();
        }
      }
      logger.warn('selectedMyStreamUrls', selectedMyStreamUrls);
      return _react2.default.createElement(_nealReact.Page, { style: { display: this.props.isClosePopup ? 'none' : '' } }, _react2.default.createElement(_head2.default, null, _react2.default.createElement('meta', { charSet: 'utf-8' }), _react2.default.createElement('title', null, title), _react2.default.createElement('meta', { name: 'description', content: description }), _react2.default.createElement('meta', { name: 'og:title', content: title }), _react2.default.createElement('meta', { name: 'og:description', content: description }), _react2.default.createElement('meta', { name: 'og:image', content: _constants.MAOMAO_SITE_URL + 'static/images/logo.png' }), _react2.default.createElement('meta', { name: 'fb:app_id', content: _constants.FACEBOOK_APP_ID }), _react2.default.createElement('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1, shrink-to-fit=no' }), _react2.default.createElement('link', { rel: 'chrome-webstore-item', href: 'https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk' }), _react2.default.createElement('script', { src: 'https://code.jquery.com/jquery-3.1.1.slim.min.js' }), _react2.default.createElement('script', { src: 'https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js' }), _react2.default.createElement('script', { src: 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js' }), _react2.default.createElement('link', { rel: 'stylesheet', href: 'https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css' }), _react2.default.createElement('link', { rel: 'stylesheet', href: '/static/vendors/css/nprogress.css' })), _react2.default.createElement(_nealReact.Navbar, { brand: brand }, _react2.default.createElement(_nealReact.NavItem, null, _react2.default.createElement(_link2.default, { href: '/', className: 'nav-link' }, 'Home')), _react2.default.createElement(_nealReact.NavItem, null, _react2.default.createElement(_link2.default, { prefetch: true, href: '/discovery', className: 'nav-link' }, 'Discovery')), _react2.default.createElement(_nealReact.NavItem, null, _react2.default.createElement(_link2.default, { prefetch: true, href: '/hiring', className: 'nav-link' }, 'Hiring')), this.props.store.isInstall && _react2.default.createElement(_AppHeader2.default, { notify: this.addNotification })), _react2.default.createElement(_reactNotification.NotificationStack, {
        notifications: this.state.notifications.toArray(),
        dismissAfter: 5000,
        onDismiss: function onDismiss(notification) {
          return _this4.setState({
            notifications: _this4.state.notifications.delete(notification)
          });
        }
      }), _react2.default.createElement(_reactNoSsr2.default, null, (!this.props.store.isInstall || !this.props.store.isLogin) && _react2.default.createElement(_ChromeInstall2.default, {
        description: description,
        title: 'Unlock Now',
        install: this.inlineInstall
      })), this.props.store.isInstall && this.props.store.isLogin && _react2.default.createElement('div', { className: 'container' }, _react2.default.createElement(_reactTabs.Tabs, {
        onSelect: this.handleSelect,
        selectedIndex: 0
      }, _react2.default.createElement(_reactTabs.TabList, null, _react2.default.createElement(_reactTabs.Tab, null, 'Your Streams'), _react2.default.createElement(_reactTabs.Tab, null, 'Friend Streams')), _react2.default.createElement(_reactTabs.TabPanel, null, _react2.default.createElement(_YourStreams2.default, {
        topics: sortedTopicByUrls,
        activeId: currentTermId,
        changeTerm: function changeTerm(termId) {
          _this4.props.store.currentTermId = termId;
        }
      }), _react2.default.createElement(_Loading2.default, { isLoading: this.props.store.userHistoryResult && this.props.store.userHistoryResult.state === 'pending' }), _react2.default.createElement('br', null), _react2.default.createElement(_StreamList2.default, { urls: selectedMyStreamUrls })), _react2.default.createElement(_reactTabs.TabPanel, null, _react2.default.createElement(_FriendStreams2.default, {
        friends: friends,
        activeId: friendStreamId,
        changeFriendStream: function changeFriendStream(userId) {
          _this4.props.store.friendStreamId = userId;
        }
      }), _react2.default.createElement(_Loading2.default, { isLoading: this.props.store.userHistoryResult && this.props.store.userHistoryResult.state === 'pending' }), _react2.default.createElement('br', null), _react2.default.createElement(_StreamList2.default, { urls: selectedFriendStreamUrls })))), _react2.default.createElement(_nealReact.Footer, { brandName: brandName,
        facebookUrl: 'http://www.facebook.com',
        twitterUrl: 'http://www.twitter.com/',
        address: businessAddress
      }));
    }
  }]);

  return Home;
}(_react2.default.Component)) || _class) || _class);

exports.default = Home;