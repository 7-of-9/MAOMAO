'use strict';

/**
*
* StreamItem
*
*/

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactStars = require('react-stars');

var _reactStars2 = _interopRequireDefault(_reactStars);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _DiscoveryButton = require('../../components/DiscoveryButton');

var _DiscoveryButton2 = _interopRequireDefault(_DiscoveryButton);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable camelcase */
function StreamItem(_ref) {
  var url = _ref.url,
      maxScore = _ref.maxScore;
  var id = url.id,
      href = url.href,
      img = url.img,
      title = url.title,
      im_score = url.im_score,
      time_on_tab = url.time_on_tab,
      hit_utc = url.hit_utc;

  var rate = Math.ceil(im_score / maxScore * 5);
  var discoveryKeys = [];
  if (url && url.suggestions_for_url && url.suggestions_for_url.length) {
    discoveryKeys = _lodash2.default.map(url.suggestions_for_url, 'term_name');
  }
  return _react2.default.createElement('div', null, _react2.default.createElement('a', { href: href, target: '_blank' }, _react2.default.createElement('img', { src: img || '/static/images/no-image.png', alt: title }), _react2.default.createElement('h4', null, title, ' (', id, ')')), _react2.default.createElement('p', null, ' Earned XP ', href.length, ' ', _moment2.default.duration(time_on_tab).humanize(), ' '), _react2.default.createElement(_reactStars2.default, { edit: false, size: 22, count: 5, value: rate }), _react2.default.createElement('span', null, (0, _moment2.default)(hit_utc).fromNow()), discoveryKeys && discoveryKeys.length > 0 && _react2.default.createElement(_DiscoveryButton2.default, { keys: discoveryKeys.join(',') }));
}exports.default = StreamItem;