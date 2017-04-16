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

var _desc, _value, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12;

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
    var _this = this;

    (0, _classCallCheck3.default)(this, HomeStore);

    _initDefineProp(this, 'googleConnectResult', _descriptor, this);

    _initDefineProp(this, 'facebookConnectResult', _descriptor2, this);

    _initDefineProp(this, 'userHistoryResult', _descriptor3, this);

    _initDefineProp(this, 'userId', _descriptor4, this);

    _initDefineProp(this, 'currentTermId', _descriptor5, this);

    _initDefineProp(this, 'friendStreamId', _descriptor6, this);

    _initDefineProp(this, 'isLogin', _descriptor7, this);

    _initDefineProp(this, 'isInstall', _descriptor8, this);

    _initDefineProp(this, 'userHash', _descriptor9, this);

    _initDefineProp(this, 'googleUser', _descriptor10, this);

    _initDefineProp(this, 'facebookUser', _descriptor11, this);

    _initDefineProp(this, 'userHistory', _descriptor12, this);

    this.isLogin = isLogin;
    this.isInstall = isInstall;
    (0, _mobx.autorun)(function () {
      if (_this.isInstall) {
        logger.warn('User is ready');
      }
      if (_this.isLogin) {
        logger.warn('User has logged in');
      }
    });
    (0, _mobx.when)(function () {
      return _this.userId > 0 && _this.userHash.length > 0;
    }, function () {
      logger.warn('yeah...');
      _this.getUserHistory();
      _this.acceptInviteCode();
    });
  }

  (0, _createClass3.default)(HomeStore, [{
    key: 'checkInstallAndAuth',
    value: function checkInstallAndAuth() {
      var _this2 = this;

      (0, _simpleAuth.userId)().then(function (id) {
        _this2.userId = id;
        logger.warn('userId', _this2.userId);
        if (id > 0) {
          _this2.isLogin = true;
        } else {
          _this2.isLogin = false;
        }
      });
      (0, _simpleAuth.userHash)().then(function (hash) {
        _this2.userHash = hash;
        logger.warn('userHash', _this2.userHash);
      });
      logger.warn('hasInstalledExtension', (0, _chrome.hasInstalledExtension)());
      this.isInstall = (0, _chrome.hasInstalledExtension)();
    }
  }, {
    key: 'acceptInviteCode',
    value: function acceptInviteCode() {
      logger.warn('acceptInviteCode');
    }
  }, {
    key: 'googleConnect',
    value: function googleConnect(info) {
      var _this3 = this;

      this.googleConnectResult = (0, _user.loginWithGoogle)(info);
      (0, _mobx.when)(function () {
        return _this3.googleConnectResult.state !== 'pending';
      }, function () {
        var data = _this3.googleConnectResult.value.data;

        var userHash = (0, _hash.md5hash)(info.googleId);
        (0, _simpleAuth.login)(data.id, data.email, userHash);
        _this3.userId = data.id;
        _this3.userHash = userHash;
        _this3.isLogin = true;
        _this3.googleUser = (0, _assign2.default)({}, data, { userHash: userHash });
      });
    }
  }, {
    key: 'facebookConnect',
    value: function facebookConnect(info) {
      var _this4 = this;

      this.facebookConnectResult = (0, _user.loginWithFacebook)(info);
      (0, _mobx.when)(function () {
        return _this4.facebookConnectResult.state !== 'pending';
      }, function () {
        var data = _this4.facebookConnectResult.value.data;

        var userHash = (0, _hash.md5hash)(info.userID);
        (0, _simpleAuth.login)(data.id, data.email, userHash);
        _this4.userId = data.id;
        _this4.userHash = userHash;
        _this4.isLogin = true;
        _this4.facebookUser = (0, _assign2.default)({}, data, { userHash: userHash });
      });
    }
  }, {
    key: 'getUserHistory',
    value: function getUserHistory() {
      var _this5 = this;

      logger.warn('getUserHistory', this.userId, this.userHash);
      this.userHistoryResult = (0, _user.getUserHistory)(this.userId, this.userHash);
      (0, _mobx.when)(function () {
        return _this5.userHistoryResult.state !== 'pending';
      }, function () {
        _this5.userHistory = _this5.userHistoryResult.value.data;
        logger.warn('userHistory', _this5.userHistory);
      });
    }
  }, {
    key: 'changeTerm',
    value: function changeTerm(termId) {
      logger.warn('changeTerm', termId);
      this.currentTermId = termId;
      this.friendStreamId = -1;
    }
  }, {
    key: 'changeFriendStream',
    value: function changeFriendStream(userId) {
      logger.warn('changeFriendStream', userId);
      this.currentTermId = -1;
      this.friendStreamId = userId;
    }
  }, {
    key: 'logoutUser',
    value: function logoutUser() {
      (0, _simpleAuth.logout)();
      this.isLogin = false;
      this.userId = -1;
      this.userHash = '';
      this.userHistory = null;
    }
  }]);

  return HomeStore;
}(), (_descriptor = _applyDecoratedDescriptor(_class.prototype, 'googleConnectResult', [_mobx.observable], {
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
}), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, 'userId', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return -1;
  }
}), _descriptor5 = _applyDecoratedDescriptor(_class.prototype, 'currentTermId', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return -1;
  }
}), _descriptor6 = _applyDecoratedDescriptor(_class.prototype, 'friendStreamId', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return -1;
  }
}), _descriptor7 = _applyDecoratedDescriptor(_class.prototype, 'isLogin', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return false;
  }
}), _descriptor8 = _applyDecoratedDescriptor(_class.prototype, 'isInstall', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return false;
  }
}), _descriptor9 = _applyDecoratedDescriptor(_class.prototype, 'userHash', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return '';
  }
}), _descriptor10 = _applyDecoratedDescriptor(_class.prototype, 'googleUser', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return {};
  }
}), _descriptor11 = _applyDecoratedDescriptor(_class.prototype, 'facebookUser', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return {};
  }
}), _descriptor12 = _applyDecoratedDescriptor(_class.prototype, 'userHistory', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return null;
  }
}), _applyDecoratedDescriptor(_class.prototype, 'checkInstallAndAuth', [_mobx.action], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'checkInstallAndAuth'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'acceptInviteCode', [_mobx.action], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'acceptInviteCode'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'googleConnect', [_mobx.action], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'googleConnect'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'facebookConnect', [_mobx.action], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'facebookConnect'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getUserHistory', [_mobx.action], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getUserHistory'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'changeTerm', [_mobx.action], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'changeTerm'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'changeFriendStream', [_mobx.action], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'changeFriendStream'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'logoutUser', [_mobx.action], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'logoutUser'), _class.prototype)), _class);

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