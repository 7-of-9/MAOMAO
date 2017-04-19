'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _mobxReact = require('mobx-react');

var _Discovery = require('../containers/Discovery');

var _Discovery2 = _interopRequireDefault(_Discovery);

var _discovery = require('../stores/discovery');

var _index = require('../styles/index.scss');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DiscoveryPage = function (_React$Component) {
  (0, _inherits3.default)(DiscoveryPage, _React$Component);

  (0, _createClass3.default)(DiscoveryPage, null, [{
    key: 'getInitialProps',
    value: function getInitialProps(_ref) {
      var req = _ref.req,
          search = _ref.query.search;

      var isServer = !!req;
      var terms = [];
      if (search) {
        terms = search.split(',');
      }
      var store = (0, _discovery.initStore)(isServer, terms);
      return { isServer: isServer, store: store, terms: terms };
    }
  }]);

  function DiscoveryPage(props) {
    (0, _classCallCheck3.default)(this, DiscoveryPage);

    var _this = (0, _possibleConstructorReturn3.default)(this, (DiscoveryPage.__proto__ || (0, _getPrototypeOf2.default)(DiscoveryPage)).call(this, props));

    _this.store = (0, _discovery.initStore)(props.isServer, props.terms);
    return _this;
  }

  (0, _createClass3.default)(DiscoveryPage, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(_mobxReact.Provider, { store: this.store }, _react2.default.createElement('div', null, _react2.default.createElement('style', { dangerouslySetInnerHTML: { __html: _index2.default } }), _react2.default.createElement(_Discovery2.default, null)));
    }
  }]);

  return DiscoveryPage;
}(_react2.default.Component);

exports.default = DiscoveryPage;