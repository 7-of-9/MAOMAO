'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.googleKnowlegeSearchByTerm = googleKnowlegeSearchByTerm;
exports.youtubeSearchByKeyword = youtubeSearchByKeyword;

var _mobxUtils = require('mobx-utils');

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _queryString = require('query-string');

var _queryString2 = _interopRequireDefault(_queryString);

var _constants = require('../containers/App/constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Google knowledge search base on term
 * @param string term
 * @param number page
 * @return promise object
 */
function googleKnowlegeSearchByTerm(term, page) {
  var buildQuery = _queryString2.default.stringify({
    query: term,
    key: _constants.GOOGLE_API_KEY,
    limit: _constants.LIMIT * page,
    indent: 'True'
  });
  var requestURL = 'https://kgsearch.googleapis.com/v1/entities:search?' + buildQuery;
  return (0, _mobxUtils.fromPromise)(_axios2.default.get(requestURL));
}

/**
 * Search youtube by keyword and page token
 * @param string keyword
 * @param number pageToken
 * @return promise object
 */
function youtubeSearchByKeyword(keyword, pageToken) {
  var buildQuery = _queryString2.default.stringify({
    q: keyword,
    key: _constants.GOOGLE_API_KEY,
    maxResults: _constants.LIMIT,
    part: 'snippet',
    type: 'video',
    pageToken: pageToken
  });
  var requestURL = 'https://www.googleapis.com/youtube/v3/search?' + buildQuery;
  return (0, _mobxUtils.fromPromise)(_axios2.default.get(requestURL));
}