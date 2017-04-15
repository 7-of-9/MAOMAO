'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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

var _home = require('../stores/home');

var _Home = require('../containers/Home');

var _Home2 = _interopRequireDefault(_Home);

var _index = require('../styles/index.scss');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HomePage = function (_React$Component) {
  (0, _inherits3.default)(HomePage, _React$Component);

  (0, _createClass3.default)(HomePage, null, [{
    key: 'getInitialProps',
    value: function getInitialProps(_ref) {
      var req = _ref.req;

      var isServer = !!req;
      var store = (0, _home.initStore)(isServer, false);
      return (0, _extends3.default)({ isServer: isServer }, store);
    }
  }]);

  function HomePage(props) {
    (0, _classCallCheck3.default)(this, HomePage);

    var _this = (0, _possibleConstructorReturn3.default)(this, (HomePage.__proto__ || (0, _getPrototypeOf2.default)(HomePage)).call(this, props));

    var _props$url$query = props.url.query,
        close = _props$url$query.close,
        success = _props$url$query.success;

    if (close && close === 'popup' || success && Number(success) === 1) {
      _this.isClosePopup = true;
    } else {
      _this.isClosePopup = false;
    }
    _this.store = (0, _home.initStore)(props.isServer, props.isLogin);
    return _this;
  }

  (0, _createClass3.default)(HomePage, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(_mobxReact.Provider, { store: this.store }, _react2.default.createElement('div', null, _react2.default.createElement('style', { dangerouslySetInnerHTML: { __html: _index2.default } }), _react2.default.createElement(_Home2.default, { isClosePopup: this.isClosePopup })));
    }
  }]);

  return HomePage;
}(_react2.default.Component);

exports.default = HomePage;