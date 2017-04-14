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

var _invite = require('../stores/invite');

var _Home = require('../containers/Home');

var _Home2 = _interopRequireDefault(_Home);

var _index = require('../styles/index.scss');

var _index2 = _interopRequireDefault(_index);

var _loglevel = require('loglevel');

var log = _interopRequireWildcard(_loglevel);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Invite = function (_React$Component) {
  (0, _inherits3.default)(Invite, _React$Component);

  (0, _createClass3.default)(Invite, null, [{
    key: 'getInitialProps',
    value: function getInitialProps(_ref) {
      var req = _ref.req,
          _ref$query = _ref.query,
          code = _ref$query.code,
          shareInfo = _ref$query.shareInfo;

      var isServer = !!req;
      var store = (0, _invite.initStore)(isServer, code, shareInfo, false, false);
      return (0, _extends3.default)({ isServer: isServer }, store);
    }
  }]);

  function Invite(props) {
    (0, _classCallCheck3.default)(this, Invite);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Invite.__proto__ || (0, _getPrototypeOf2.default)(Invite)).call(this, props));

    log.warn('Invite props', props);
    _this.store = (0, _invite.initStore)(props.isServer, props.shareCode, props.shareInfo, props.isLogin, props.isInstall);
    return _this;
  }

  (0, _createClass3.default)(Invite, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(_mobxReact.Provider, { store: this.store }, _react2.default.createElement('div', null, _react2.default.createElement('style', { dangerouslySetInnerHTML: { __html: _index2.default } }), _react2.default.createElement(_Home2.default, null)));
    }
  }]);

  return Invite;
}(_react2.default.Component);

exports.default = Invite;