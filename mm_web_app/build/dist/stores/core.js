'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CoreStore = undefined;
exports.initStore = initStore;

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _mobx = require('mobx');

var _loglevel = require('loglevel');

var logger = _interopRequireWildcard(_loglevel);

var _detector = require('../utils/detector');

var _chrome = require('../utils/chrome');

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

var CoreStore = exports.CoreStore = (_class = function () {
  function CoreStore(isServer, userAgent) {
    (0, _classCallCheck3.default)(this, CoreStore);

    this.isMobile = false;
    this.isChrome = false;
    this.userAgent = {};

    _initDefineProp(this, 'userHash', _descriptor, this);

    _initDefineProp(this, 'userId', _descriptor2, this);

    _initDefineProp(this, 'isInstall', _descriptor3, this);

    _initDefineProp(this, 'isLogin', _descriptor4, this);

    this.userAgent = userAgent;
    this.isMobile = (0, _detector.isMobileBrowser)(userAgent);
    if (!isServer) {
      this.isChrome = (0, _detector.isChromeBrowser)();
      this.isInstall = (0, _chrome.hasInstalledExtension)();
    }
  }

  (0, _createClass3.default)(CoreStore, [{
    key: 'checkEnvironment',
    value: function checkEnvironment() {
      logger.warn('checkEnvironment');
      this.isChrome = (0, _detector.isChromeBrowser)();
      if (this.isChrome) {
        this.isInstall = (0, _chrome.hasInstalledExtension)();
      }
    }
  }, {
    key: 'autoLogin',
    value: function autoLogin(auth) {
      logger.warn('autoLogin', auth);
      var isLogin = auth.isLogin,
          userId = auth.userId,
          userHash = auth.userHash;

      if (userId > 0) {
        this.isLogin = isLogin;
        this.userId = userId;
        this.userHash = userHash;
      }
    }
  }, {
    key: 'logoutUser',
    value: function logoutUser() {
      if (this.isChrome && this.isInstall) {
        (0, _chrome.sendMsgToChromeExtension)((0, _chrome.actionCreator)('AUTH_LOGOUT', {}));
      }
      this.isLogin = false;
      this.userId = -1;
      this.userHash = '';
      this.userHistory = null;
    }
  }, {
    key: 'isInstalledOnChromeDesktop',
    get: function get() {
      return this.isInstall && this.isChrome && !this.isMobile;
    }
  }]);

  return CoreStore;
}(), (_descriptor = _applyDecoratedDescriptor(_class.prototype, 'userHash', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return '';
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, 'userId', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return -1;
  }
}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, 'isInstall', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return false;
  }
}), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, 'isLogin', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return false;
  }
}), _applyDecoratedDescriptor(_class.prototype, 'isInstalledOnChromeDesktop', [_mobx.computed], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'isInstalledOnChromeDesktop'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'checkEnvironment', [_mobx.action], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'checkEnvironment'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'autoLogin', [_mobx.action], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'autoLogin'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'logoutUser', [_mobx.action], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'logoutUser'), _class.prototype)), _class);

function initStore(isServer) {
  var userAgent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  logger.warn('init CoreStore');
  if (isServer && typeof window === 'undefined') {
    return new CoreStore(isServer, userAgent);
  } else {
    if (store === null) {
      store = new CoreStore(isServer, userAgent);
    }
    return store;
  }
}