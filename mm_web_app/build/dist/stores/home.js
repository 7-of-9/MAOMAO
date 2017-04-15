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

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _mobx = require('mobx');

var _loglevel = require('loglevel');

var logger = _interopRequireWildcard(_loglevel);

var _user = require('../services/user');

var _simpleAuth = require('../utils/simpleAuth');

var _chrome = require('../utils/chrome');

var _hash = require('../utils/hash');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _desc, _value, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4;

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

var HomeStore = exports.HomeStore = (_class = function () {
  function HomeStore(isServer, isLogin, isInstall) {
    (0, _classCallCheck3.default)(this, HomeStore);

    _initDefineProp(this, 'isLogin', _descriptor, this);

    _initDefineProp(this, 'isInstall', _descriptor2, this);

    _initDefineProp(this, 'googleConnectResult', _descriptor3, this);

    _initDefineProp(this, 'facebookConnectResult', _descriptor4, this);

    this.googleUser = {};
    this.facebookUser = {};

    this.isLogin = isLogin;
    this.isInstall = isInstall;
  }

  (0, _createClass3.default)(HomeStore, [{
    key: 'checkInstallAndAuth',
    value: function checkInstallAndAuth() {
      var _this = this;

      (0, _simpleAuth.userId)().then(function (id) {
        logger.warn('userId', id);
        if (id > 0) {
          _this.isLogin = true;
        } else {
          _this.isLogin = false;
        }
      });
      logger.warn('hasInstalledExtension', (0, _chrome.hasInstalledExtension)());
      this.isInstall = (0, _chrome.hasInstalledExtension)();
    }
  }, {
    key: 'googleConnect',
    value: function googleConnect(info) {
      var _this2 = this;

      this.googleConnectResult = (0, _user.loginWithGoogle)(info);
      (0, _mobx.when)(function () {
        return _this2.googleConnectResult.state !== 'pending';
      }, function () {
        var data = _this2.googleConnectResult.value.data;

        var userHash = (0, _hash.md5hash)(info.googleId);
        (0, _simpleAuth.login)(data.id, data.email, userHash);
        _this2.isLogin = true;
        _this2.googleUser = (0, _assign2.default)({}, data, { userHash: userHash });
        _this2.userHistory(data.id, userHash);
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
        (0, _simpleAuth.login)(data.id, data.email, userHash);
        _this3.isLogin = true;
        _this3.facebookUser = (0, _assign2.default)({}, data, { userHash: userHash });
        _this3.userHistory(data.id, userHash);
      });
    }
  }, {
    key: 'userHistory',
    value: function userHistory(id, hash) {
      logger.warn('userHistory', id, hash);
    }
  }, {
    key: 'logoutUser',
    value: function logoutUser() {
      (0, _simpleAuth.logout)();
      this.isLogin = false;
    }
  }]);

  return HomeStore;
}(), (_descriptor = _applyDecoratedDescriptor(_class.prototype, 'isLogin', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return false;
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, 'isInstall', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return false;
  }
}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, 'googleConnectResult', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return {};
  }
}), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, 'facebookConnectResult', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return {};
  }
}), _applyDecoratedDescriptor(_class.prototype, 'checkInstallAndAuth', [_mobx.action], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'checkInstallAndAuth'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'googleConnect', [_mobx.action], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'googleConnect'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'facebookConnect', [_mobx.action], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'facebookConnect'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'userHistory', [_mobx.action], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'userHistory'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'logoutUser', [_mobx.action], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'logoutUser'), _class.prototype)), _class);

(0, _mobx.autorun)(function () {
  if (store && store.isInstall) {
    logger.warn('User is ready');
  }

  if (store && store.isLogin) {
    logger.warn('User has logged in');
  }

  if (store && store.googleConnectResult) {
    logger.warn('googleConnectResult', store.googleConnectResult);
  }
});

function initStore(isServer) {
  var isLogin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  if (isServer && typeof window === 'undefined') {
    return new HomeStore(isServer, isLogin, false);
  } else {
    if (store === null) {
      store = new HomeStore(isServer, isLogin, (0, _chrome.hasInstalledExtension)());
    }
    return store;
  }
}