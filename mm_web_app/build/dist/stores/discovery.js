'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
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

var _google = require('../services/google');

var _loglevel = require('loglevel');

var logger = _interopRequireWildcard(_loglevel);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _desc, _value, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5;

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

var DiscoveryStore = (_class = function () {
  (0, _createClass3.default)(DiscoveryStore, [{
    key: 'changeTerms',
    value: function changeTerms(terms) {
      this.terms = terms;
    }
  }, {
    key: 'search',
    value: function search(page) {
      this.page = page;
      this.googleKnowledgeResult = (0, _google.googleKnowlegeSearchByTerm)(this.terms.join(' '), this.page);
      this.youtubeResult = (0, _google.youtubeSearchByKeyword)(this.terms.join(' '), this.youtubePageToken);
    }
  }]);

  function DiscoveryStore(isServer, terms) {
    (0, _classCallCheck3.default)(this, DiscoveryStore);

    _initDefineProp(this, 'terms', _descriptor, this);

    _initDefineProp(this, 'page', _descriptor2, this);

    _initDefineProp(this, 'youtubePageToken', _descriptor3, this);

    _initDefineProp(this, 'googleKnowledgeResult', _descriptor4, this);

    _initDefineProp(this, 'youtubeResult', _descriptor5, this);

    this.terms = terms;
  }

  return DiscoveryStore;
}(), (_descriptor = _applyDecoratedDescriptor(_class.prototype, 'terms', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return [];
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, 'page', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return 1;
  }
}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, 'youtubePageToken', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return '';
  }
}), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, 'googleKnowledgeResult', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return {};
  }
}), _descriptor5 = _applyDecoratedDescriptor(_class.prototype, 'youtubeResult', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return {};
  }
}), _applyDecoratedDescriptor(_class.prototype, 'changeTerms', [_mobx.action], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'changeTerms'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'search', [_mobx.action], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'search'), _class.prototype)), _class);

function initStore(isServer) {
  var terms = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  logger.warn('DiscoveryStore');
  if (isServer && typeof window === 'undefined') {
    return new DiscoveryStore(isServer, terms);
  } else {
    if (store === null) {
      store = new DiscoveryStore(isServer, terms);
    }
    return store;
  }
}