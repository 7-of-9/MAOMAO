'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.md5hash = md5hash;
exports.guid = guid;

var _blueimpMd = require('blueimp-md5');

var _blueimpMd2 = _interopRequireDefault(_blueimpMd);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function md5hash(userId) {
  var hash = (0, _blueimpMd2.default)(userId);
  var toUpperCase = String.prototype.toUpperCase;
  return toUpperCase.call(hash);
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return '' + s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4() + s4();
}