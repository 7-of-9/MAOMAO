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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _loglevel = require('loglevel');

var logger = _interopRequireWildcard(_loglevel);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function FriendStreams(_ref) {
  var friends = _ref.friends,
      changeFriendStream = _ref.changeFriendStream,
      activeId = _ref.activeId;

  var items = [];
  logger.warn('friends', friends);
  if (friends && friends.length) {
    _lodash2.default.forEach(friends, function (friend) {
      if (friend && friend.user_id) {
        items.push(_react2.default.createElement('a', {
          onClick: function onClick(e) {
            e.preventDefault();
            changeFriendStream(friend.user_id);
          }, key: friend.user_id
        }, _react2.default.createElement('button', { className: '' + (activeId === friend.user_id ? 'btn-primary' : '') }, friend.fullname)));
      }
    });
  }
  return _react2.default.createElement('div', { className: 'container-fluid' }, _react2.default.createElement('h1', null, 'Friend Streams'), items);
}

exports.default = FriendStreams;