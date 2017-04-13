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

var _masonryLayout = require('masonry-layout');

var _masonryLayout2 = _interopRequireDefault(_masonryLayout);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
*
* Block
*
*/

var TIME_TO_RELOAD = 1000; // 1s

function Block(WrappedComponent) {
  return function (_React$Component) {
    (0, _inherits3.default)(_class, _React$Component);

    function _class() {
      (0, _classCallCheck3.default)(this, _class);

      return (0, _possibleConstructorReturn3.default)(this, (_class.__proto__ || (0, _getPrototypeOf2.default)(_class)).apply(this, arguments));
    }

    (0, _createClass3.default)(_class, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var _this2 = this;

        this.layer = new _masonryLayout2.default(this.container, {
          fitWidth: true,
          columnWidth: 240,
          gutter: 10,
          itemSelector: '.grid-item'
        });
        // Fix position layer
        this.timer = setInterval(function () {
          if (_this2.container) {
            _this2.layer = new _masonryLayout2.default(_this2.container, {
              fitWidth: true,
              columnWidth: 240,
              gutter: 10,
              itemSelector: '.grid-item'
            });
          }
        }, TIME_TO_RELOAD);
      }
    }, {
      key: 'componentDidUpdate',
      value: function componentDidUpdate() {
        // Fix position when loading image
        this.layer = new _masonryLayout2.default(this.container, {
          fitWidth: true,
          columnWidth: 240,
          gutter: 10,
          itemSelector: '.grid-item'
        });
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        clearInterval(this.timer);
      }
    }, {
      key: 'render',
      value: function render() {
        var _this3 = this;

        return _react2.default.createElement('div', { className: 'grid', ref: function ref(element) {
            _this3.container = element;
          } }, _react2.default.createElement(WrappedComponent, this.props));
      }
    }]);

    return _class;
  }(_react2.default.Component);
}

exports.default = Block;