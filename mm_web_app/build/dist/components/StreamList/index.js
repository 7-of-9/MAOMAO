'use strict';

/**
*
* StreamList
*
*/

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _StreamItem = require('../../components/StreamItem');

var _StreamItem2 = _interopRequireDefault(_StreamItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function StreamList(_ref) {
  var urls = _ref.urls;

  var items = [];
  if (urls && urls.length) {
    var maxScore = _lodash2.default.maxBy(urls, 'im_score');
    var sortedUrlsByHitUTC = _lodash2.default.reverse(_lodash2.default.sortBy(urls, [function (url) {
      return url.hit_utc;
    }]));
    items.push(_react2.default.createElement('div', { key: Date.now() + 1, style: { clear: 'both' } }));
    _lodash2.default.forEach(sortedUrlsByHitUTC, function (item) {
      items.push(_react2.default.createElement(_StreamItem2.default, { key: item.id, url: item, maxScore: maxScore.im_score }));
    });
  }
  return _react2.default.createElement('div', { className: 'row' }, items);
}exports.default = StreamList;