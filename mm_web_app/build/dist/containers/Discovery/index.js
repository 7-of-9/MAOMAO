'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Discovery = undefined;

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

var _reactSticky = require('react-sticky');

var _reactNoSsr = require('react-no-ssr');

var _reactNoSsr2 = _interopRequireDefault(_reactNoSsr);

var _reactInfiniteScroller = require('react-infinite-scroller');

var _reactInfiniteScroller2 = _interopRequireDefault(_reactInfiniteScroller);

var _Loading = require('../../components/Loading');

var _Loading2 = _interopRequireDefault(_Loading);

var _Header = require('../../components/Header');

var _Header2 = _interopRequireDefault(_Header);

var _SearchBar = require('../../components/SearchBar');

var _SearchBar2 = _interopRequireDefault(_SearchBar);

var _LogoIcon = require('../../components/LogoIcon');

var _LogoIcon2 = _interopRequireDefault(_LogoIcon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import Block from '../../components/Block'
var SRRLoading = function SRRLoading() {
  return _react2.default.createElement('div', null, 'Loading...');
};
var Discovery = exports.Discovery = function (_React$Component) {
  (0, _inherits3.default)(Discovery, _React$Component);

  function Discovery() {
    (0, _classCallCheck3.default)(this, Discovery);

    return (0, _possibleConstructorReturn3.default)(this, (Discovery.__proto__ || (0, _getPrototypeOf2.default)(Discovery)).apply(this, arguments));
  }

  (0, _createClass3.default)(Discovery, [{
    key: 'render',
    value: function render() {
      var elements = [];
      return _react2.default.createElement(_reactSticky.StickyContainer, null, _react2.default.createElement(_reactSticky.Sticky, { style: { zIndex: 100, backgroundColor: '#fff' } }, _react2.default.createElement(_Header2.default, null, _react2.default.createElement(_LogoIcon2.default, null), _react2.default.createElement(_SearchBar2.default, null))), elements.length > 0 && _react2.default.createElement(_reactNoSsr2.default, { onSSR: _react2.default.createElement(SRRLoading, null) }, _react2.default.createElement(_reactInfiniteScroller2.default, {
        loadMore: this.props.loadMore,
        hasMore: this.props.loading,
        threshold: 200
      }, elements)), _react2.default.createElement(_Loading2.default, { isLoading: this.props.loading }));
    }
  }]);

  return Discovery;
}(_react2.default.Component);

exports.default = Discovery;