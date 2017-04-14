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

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _mobx = require('mobx');

var _loglevel = require('loglevel');

var logger = _interopRequireWildcard(_loglevel);

var _simpleAuth = require('../utils/simpleAuth');

var _chrome = require('../utils/chrome');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _desc, _value, _class, _descriptor, _descriptor2;

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

    this.isLogin = isLogin;
    this.isInstall = isInstall;
  }

  (0, _createClass3.default)(HomeStore, [{
    key: 'checkAuth',
    value: function checkAuth() {
      var _this = this;

      (0, _simpleAuth.userId)().then(function (id) {
        if (id > 0) {
          _this.isLogin = true;
        } else {
          _this.isLogin = false;
        }
      });
    }
  }, {
    key: 'checkInstall',
    value: function checkInstall() {
      this.isInstall = (0, _chrome.hasInstalledExtension)();
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
}), _applyDecoratedDescriptor(_class.prototype, 'checkAuth', [_mobx.action], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'checkAuth'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'checkInstall', [_mobx.action], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'checkInstall'), _class.prototype)), _class);

(0, _mobx.autorun)(function () {
  if (store) {
    logger.warn('check isInstall', store.isInstall);
    logger.warn('check isLogin', store.isLogin);
  }
});

function initStore(isServer) {
  var isLogin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var isInstall = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  if (isServer && typeof window === 'undefined') {
    return new HomeStore(isServer, isLogin, isInstall);
  } else {
    if (store === null) {
      store = new HomeStore(isServer, isLogin, isInstall);
    }
    return store;
  }
}