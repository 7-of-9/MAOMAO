'use strict';

/**
*
* YourStreams
*
*/

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function YourStreams(_ref) {
  var topics = _ref.topics,
      friends = _ref.friends,
      changeTerm = _ref.changeTerm,
      changeFriendStream = _ref.changeFriendStream,
      activeId = _ref.activeId;

  var items = [];
  if (topics && topics.length) {
    _lodash2.default.forEach(topics, function (topic) {
      if (topic.term_id) {
        items.push(_react2.default.createElement('a', {
          onClick: function onClick(e) {
            e.preventDefault();
            changeTerm(topic.term_id);
          }, style: { color: activeId === topic.term_id ? '#000' : '#fff' }, key: topic.term_id
        }, _react2.default.createElement('button', null, topic.term_name, ' (', topic.url_ids.length, ')')));
      }
    });
  }
  return _react2.default.createElement('div', { className: 'container-fluid' }, _react2.default.createElement('h1', null, 'Your Streams'), items);
}

exports.default = YourStreams;