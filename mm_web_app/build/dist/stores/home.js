'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HomeStore = undefined;
exports.initStore = initStore;

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

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

var _mobx = require('mobx');

var _loglevel = require('loglevel');

var logger = _interopRequireWildcard(_loglevel);

var _core = require('./core');

var _user = require('../services/user');

var _chrome = require('../utils/chrome');

var _hash = require('../utils/hash');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _desc, _value, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8;

function _initDefineProp(target, property, descriptor, context) {
  if (!descriptor) return;

  (0, _defineProperty2.default)(target, property, {
    enumerable: descriptor.enumerable,
    configurable: descriptor.configurable,
    writable: descriptor.writable,
    value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
  });
}

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

function _initializerWarningHelper(descriptor, context) {
  throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
}

var store = null;

var HomeStore = exports.HomeStore = (_class = function (_CoreStore) {
  (0, _inherits3.default)(HomeStore, _CoreStore);

  function HomeStore(isServer, userAgent) {
    (0, _classCallCheck3.default)(this, HomeStore);

    var _this = (0, _possibleConstructorReturn3.default)(this, (HomeStore.__proto__ || (0, _getPrototypeOf2.default)(HomeStore)).call(this, isServer, userAgent));

    _initDefineProp(_this, 'googleConnectResult', _descriptor, _this);

    _initDefineProp(_this, 'facebookConnectResult', _descriptor2, _this);

    _initDefineProp(_this, 'userHistoryResult', _descriptor3, _this);

    _initDefineProp(_this, 'currentTermId', _descriptor4, _this);

    _initDefineProp(_this, 'friendStreamId', _descriptor5, _this);

    _initDefineProp(_this, 'googleUser', _descriptor6, _this);

    _initDefineProp(_this, 'facebookUser', _descriptor7, _this);

    _initDefineProp(_this, 'userHistory', _descriptor8, _this);

    (0, _mobx.reaction)(function () {
      return _this.userHash.length;
    }, function (userHash) {
      if (userHash > 0) {
        logger.warn('yeah... getUserHistory');
        _this.getUserHistory();
      }
    });
    return _this;
  }

  (0, _createClass3.default)(HomeStore, [{
    key: 'googleConnect',
    value: function googleConnect(info) {
      var _this2 = this;

      this.googleConnectResult = (0, _user.loginWithGoogle)(info);
      (0, _mobx.when)(function () {
        return _this2.googleConnectResult.state !== 'pending';
      }, function () {
        var data = _this2.googleConnectResult.value.data;

        var userHash = (0, _hash.md5hash)(info.googleId);
        _this2.isLogin = true;
        _this2.userId = data.id;
        _this2.userHash = userHash;
        _this2.googleUser = (0, _assign2.default)({}, data, { userHash: userHash }, {
          name: info.profileObj.name,
          email: info.profileObj.email || data.email,
          picture: info.profileObj.imageUrl
        });
        // send data to chrome extension
        if (_this2.isInstalledOnChromeDesktop) {
          (0, _chrome.sendMsgToChromeExtension)((0, _chrome.actionCreator)('USER_HASH', { userHash: info.googleId }));
          (0, _chrome.sendMsgToChromeExtension)((0, _chrome.actionCreator)('AUTH_FULFILLED', {
            googleUserId: info.googleId,
            googleToken: info.accessToken,
            info: {
              name: info.profileObj.name,
              email: info.profileObj.email || data.email,
              picture: info.profileObj.imageUrl
            }
          }));
          (0, _chrome.sendMsgToChromeExtension)((0, _chrome.actionCreator)('USER_AFTER_LOGIN', { userId: data.id }));
          (0, _chrome.sendMsgToChromeExtension)((0, _chrome.actionCreator)('PRELOAD_SHARE_ALL', { userId: data.id }));
          (0, _chrome.sendMsgToChromeExtension)((0, _chrome.actionCreator)('FETCH_CONTACTS', {}));
        }
      });
    }
  }, {
    key: 'facebookConnect',
    value: function facebookConnect(info) {
      var _this3 = this;

      this.facebookConnectResult = (0, _user.loginWithFacebook)(info);
      (0, _mobx.when)(function () {
        return _this3.facebookConnectResult.state !== 'pending';
      }, function () {
        var data = _this3.facebookConnectResult.value.data;

        var userHash = (0, _hash.md5hash)(info.userID);
        _this3.userId = data.id;
        _this3.userHash = userHash;
        _this3.isLogin = true;
        _this3.facebookUser = (0, _assign2.default)({}, data, { userHash: userHash }, {
          name: info.name,
          email: info.email || data.email,
          picture: info.picture.data.url
        });
        // send data to chrome extension
        if (_this3.isInstalledOnChromeDesktop) {
          (0, _chrome.sendMsgToChromeExtension)((0, _chrome.actionCreator)('USER_HASH', { userHash: info.userID }));
          (0, _chrome.sendMsgToChromeExtension)((0, _chrome.actionCreator)('AUTH_FULFILLED', {
            facebookUserId: info.userID,
            facebookToken: info.accessToken,
            info: {
              name: info.name,
              email: info.email || data.email,
              picture: info.picture.data.url
            }
          }));
          (0, _chrome.sendMsgToChromeExtension)((0, _chrome.actionCreator)('USER_AFTER_LOGIN', { userId: data.id }));
          (0, _chrome.sendMsgToChromeExtension)((0, _chrome.actionCreator)('PRELOAD_SHARE_ALL', { userId: data.id }));
        }
      });
    }
  }, {
    key: 'getUserHistory',
    value: function getUserHistory() {
      var _this4 = this;

      logger.warn('getUserHistory', this.userId, this.userHash);
      this.userHistoryResult = (0, _user.getUserHistory)(this.userId, this.userHash);
      (0, _mobx.when)(function () {
        return _this4.userHistoryResult.state !== 'pending';
      }, function () {
        _this4.userHistory = _this4.userHistoryResult.value.data;
        logger.warn('userHistory', _this4.userHistory);
      });
    }
  }]);

  return HomeStore;
}(_core.CoreStore), (_descriptor = _applyDecoratedDescriptor(_class.prototype, 'googleConnectResult', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return {};
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, 'facebookConnectResult', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return {};
  }
}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, 'userHistoryResult', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return {};
  }
}), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, 'currentTermId', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return -1;
  }
}), _descriptor5 = _applyDecoratedDescriptor(_class.prototype, 'friendStreamId', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return -1;
  }
}), _descriptor6 = _applyDecoratedDescriptor(_class.prototype, 'googleUser', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return {};
  }
}), _descriptor7 = _applyDecoratedDescriptor(_class.prototype, 'facebookUser', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return {};
  }
}), _descriptor8 = _applyDecoratedDescriptor(_class.prototype, 'userHistory', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return null;
  }
}), _applyDecoratedDescriptor(_class.prototype, 'googleConnect', [_mobx.action], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'googleConnect'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'facebookConnect', [_mobx.action], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'facebookConnect'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getUserHistory', [_mobx.action], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getUserHistory'), _class.prototype)), _class);

function initStore(isServer, userAgent) {
  if (isServer && typeof window === 'undefined') {
    return new HomeStore(isServer, userAgent);
  } else {
    if (store === null) {
      store = new HomeStore(isServer, userAgent);
    }
    return store;
  }
}