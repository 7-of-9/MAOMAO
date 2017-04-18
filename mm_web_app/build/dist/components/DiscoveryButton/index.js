'use strict';

/**
*
* DiscoveryButton
*
*/

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _link = require('next/dist/lib/link.js');

var _link2 = _interopRequireDefault(_link);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function DiscoveryButton(_ref) {
  var keys = _ref.keys;

  var link = '/discovery';
  if (keys) {
    link = '/discovery?search=' + keys;
  }
  return _react2.default.createElement('div', null, _react2.default.createElement(_link2.default, { href: link, replace: true }, _react2.default.createElement('img', { width: '40', height: '40', src: '/static/images/discovery-icon.png', alt: 'Discovery' })));
}

DiscoveryButton.propTypes = {
  keys: _react2.default.PropTypes.string
};

exports.default = DiscoveryButton;