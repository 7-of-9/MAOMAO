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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _mobxReact = require('mobx-react');

var _reactGoogleLogin = require('react-google-login');

var _reactGoogleLogin2 = _interopRequireDefault(_reactGoogleLogin);

var _reactFacebookLogin = require('react-facebook-login');

var _reactFacebookLogin2 = _interopRequireDefault(_reactFacebookLogin);

var _nealReact = require('neal-react');

var _reactModalBootstrap = require('react-modal-bootstrap');

var _loglevel = require('loglevel');

var logger = _interopRequireWildcard(_loglevel);

var _constants = require('../../containers/App/constants');

var _chrome = require('../../utils/chrome');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _dec, _class;

/*
 *
 * AppHeader
 *
 */

var AppHeader = (_dec = (0, _mobxReact.inject)('store'), _dec(_class = (0, _mobxReact.observer)(_class = function (_React$Component) {
  (0, _inherits3.default)(AppHeader, _React$Component);

  function AppHeader(props) {
    (0, _classCallCheck3.default)(this, AppHeader);

    var _this = (0, _possibleConstructorReturn3.default)(this, (AppHeader.__proto__ || (0, _getPrototypeOf2.default)(AppHeader)).call(this, props));

    _this.state = {
      showModal: false
    };
    _this.onGoogleSuccess = _this.onGoogleSuccess.bind(_this);
    _this.onGoogleFailure = _this.onGoogleFailure.bind(_this);
    _this.responseFacebook = _this.responseFacebook.bind(_this);
    _this.onLogout = _this.onLogout.bind(_this);
    _this.onClose = _this.onClose.bind(_this);
    _this.onOpen = _this.onOpen.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(AppHeader, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      if (this.props.store.isInstalledOnChromeDesktop) {
        logger.warn('componentDidMount - Sending data to extension');
        (0, _chrome.sendMsgToChromeExtension)((0, _chrome.actionCreator)('WEB_CHECK_AUTH', {}), function (error, data) {
          if (error) {
            logger.warn(error);
          } else {
            _this2.props.store.autoLogin(data.payload);
          }
        });
      }
    }
  }, {
    key: 'onOpen',
    value: function onOpen() {
      logger.warn('onOpen');
      this.setState({ showModal: true });
    }
  }, {
    key: 'onClose',
    value: function onClose() {
      this.setState({ showModal: false });
    }
  }, {
    key: 'onGoogleSuccess',
    value: function onGoogleSuccess(response) {
      logger.warn('onGoogleSuccess', response);
      this.onClose();
      this.props.notify('Login with google account...');
      this.props.store.googleConnect(response);
    }
  }, {
    key: 'onGoogleFailure',
    value: function onGoogleFailure(error) {
      logger.warn('onGoogleSuccess', error);
      this.props.notify(error.message);
    }
  }, {
    key: 'responseFacebook',
    value: function responseFacebook(response) {
      logger.warn('responseFacebook', response);
      this.onClose();
      this.props.notify('Login with facebook account...');
      this.props.store.facebookConnect(response);
    }
  }, {
    key: 'onLogout',
    value: function onLogout() {
      logger.warn('onLogout');
      this.props.store.logoutUser();
      this.props.notify('Logout.');
    }
  }, {
    key: 'render',
    value: function render() {
      logger.warn('AppHeader', this.props, this.state);
      return _react2.default.createElement(_nealReact.NavItem, null, this.props.store.isLogin && _react2.default.createElement('button', { onClick: this.onLogout }, 'Logout'), !this.props.store.isLogin && _react2.default.createElement('button', { className: 'btn btn-login', onClick: this.onOpen }, 'Sign In'), _react2.default.createElement(_reactModalBootstrap.Modal, {
        isOpen: this.state.showModal,
        onRequestHide: this.onClose
      }, _react2.default.createElement(_reactModalBootstrap.ModalHeader, null, _react2.default.createElement(_reactModalBootstrap.ModalClose, { onClick: this.onClose }), _react2.default.createElement(_reactModalBootstrap.ModalTitle, null, 'Join MaoMao Now!')), _react2.default.createElement(_reactModalBootstrap.ModalBody, null, _react2.default.createElement('div', { className: 'container' }, _react2.default.createElement('div', { className: 'row justify-content-md-center' }, _react2.default.createElement(_reactGoogleLogin2.default, {
        clientId: _constants.GOOGLE_CLIENT_ID,
        scope: 'profile email https://www.googleapis.com/auth/contacts.readonly',
        buttonText: 'LOGIN WITH GOOGLE',
        onSuccess: this.onGoogleSuccess,
        onFailure: this.onGoogleFailure
      })), _react2.default.createElement('div', { className: 'row justify-content-md-center' }, _react2.default.createElement(_reactFacebookLogin2.default, {
        appId: _constants.FACEBOOK_APP_ID,
        autoLoad: false,
        size: 'medium',
        fields: 'name,email,picture',
        callback: this.responseFacebook
      }))))));
    }
  }]);

  return AppHeader;
}(_react2.default.Component)) || _class) || _class);

AppHeader.propTypes = {
  onGoogleSuccess: _propTypes2.default.func,
  onGoogleFailure: _propTypes2.default.func,
  responseFacebook: _propTypes2.default.func,
  notify: _propTypes2.default.func,
  onLogout: _propTypes2.default.func
};

exports.default = AppHeader;