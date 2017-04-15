'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initStore = initStore;

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _mobx = require('mobx');

var _loglevel = require('loglevel');

var logger = _interopRequireWildcard(_loglevel);

var _home = require('./home');

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

var InviteStore = (_class = function (_HomeStore) {
  (0, _inherits3.default)(InviteStore, _HomeStore);

  function InviteStore(isServer, shareCode, shareInfo, isLogin) {
    (0, _classCallCheck3.default)(this, InviteStore);

    var _this = (0, _possibleConstructorReturn3.default)(this, (InviteStore.__proto__ || (0, _getPrototypeOf2.default)(InviteStore)).call(this, isServer, isLogin, false));

    _initDefineProp(_this, 'shareCode', _descriptor, _this);

    _initDefineProp(_this, 'shareInfo', _descriptor2, _this);

    _this.shareCode = shareCode;
    _this.shareInfo = shareInfo;
    return _this;
  }

  return InviteStore;
}(_home.HomeStore), (_descriptor = _applyDecoratedDescriptor(_class.prototype, 'shareCode', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return '';
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, 'shareInfo', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return {};
  }
})), _class);

function initStore(isServer) {
  var shareCode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var shareInfo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var isLogin = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  logger.warn('init InviteStore');
  if (isServer && typeof window === 'undefined') {
    return new InviteStore(isServer, shareCode, shareInfo, isLogin);
  } else {
    if (store === null) {
      store = new InviteStore(isServer, shareCode, shareInfo, isLogin);
    }
    return store;
  }
}