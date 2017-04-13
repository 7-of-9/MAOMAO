'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initStore = initStore;

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _mobx = require('mobx');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _desc, _value, _class, _descriptor, _descriptor2, _descriptor3;

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

// import { getShareInfo } from './services/share'

var store = null;

var HomeStore = (_class = function HomeStore(isServer, isLogin) {
  (0, _classCallCheck3.default)(this, HomeStore);

  _initDefineProp(this, 'isLogin', _descriptor, this);

  _initDefineProp(this, 'shareCode', _descriptor2, this);

  _initDefineProp(this, 'shareInfo', _descriptor3, this);

  this.isLogin = isLogin;
}, (_descriptor = _applyDecoratedDescriptor(_class.prototype, 'isLogin', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return false;
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, 'shareCode', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return '';
  }
}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, 'shareInfo', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return {
      fullName: '',
      urlTitle: '',
      topicTitle: '',
      isShareAll: false
    };
  }
})), _class);

function initStore(isServer) {
  var isLogin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  if (isServer && typeof window === 'undefined') {
    return new HomeStore(isServer, isLogin);
  } else {
    if (store === null) {
      store = new HomeStore(isServer, isLogin);
    }
    return store;
  }
}