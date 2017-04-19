'use strict';

/**
*
* SearchBar
*
*/

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _recompose = require('recompose');

var _reactTagInput = require('react-tag-input');

var _loglevel = require('loglevel');

var logger = _interopRequireWildcard(_loglevel);

var _Form = require('./Form');

var _Form2 = _interopRequireDefault(_Form);

var _A = require('./A');

var _A2 = _interopRequireDefault(_A);

var _Input = require('./Input');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TEST_SET_1 = ['Classical music', 'Musical', 'Musical compositions', 'Musical history', '1840s', 'Arts'];
var TEST_SET_2 = ['Hanna-Barbera', 'Warner Bros', 'Cartoon Network', 'Rivalry', 'Anthropomorphism'];
var TEST_SET_3 = ['Chess', 'Traditional games', 'Games', 'Board games', 'Game theory'];
var TEST_SET_4 = ['Human sexuality', 'Auctions', 'Human reproduction', 'Sex', 'Human behavior'];

var SearchBar = function SearchBar(_ref) {
  var tags = _ref.tags,
      onSearch = _ref.onSearch,
      changeTags = _ref.changeTags,
      handleDelete = _ref.handleDelete,
      handleAddition = _ref.handleAddition;
  return _react2.default.createElement(_Form2.default, { onSubmit: onSearch }, _react2.default.createElement(_A2.default, { onClick: function onClick() {
      changeTags(TEST_SET_1);
    } }, ' Test Set 1 '), ' |', _react2.default.createElement(_A2.default, { onClick: function onClick() {
      changeTags(TEST_SET_2);
    } }, ' Test Set 2 '), ' |', _react2.default.createElement(_A2.default, { onClick: function onClick() {
      changeTags(TEST_SET_3);
    } }, ' Test Set 3 '), ' |', _react2.default.createElement(_A2.default, { onClick: function onClick() {
      changeTags(TEST_SET_4);
    } }, ' Test Set 4 '), ' |', _react2.default.createElement(_Input.InputWrapper, null, _react2.default.createElement(_Input.InputContainer, null, _react2.default.createElement(_reactTagInput.WithContext, {
    tags: tags,
    handleDelete: handleDelete,
    handleAddition: handleAddition,
    placeholder: 'Search:'
  }))));
};

var enhance = (0, _recompose.compose)((0, _recompose.withState)('tags', 'updateTags', []), (0, _recompose.withHandlers)({
  changeTags: function changeTags(props) {
    return function (newTags) {
      logger.info('changeTags', newTags);
      props.updateTags(function () {
        var tags = [];
        for (var counter = 0; counter < newTags.length; counter += 1) {
          tags.push({
            id: counter + 1,
            text: newTags[counter]
          });
        }
        var selectedTags = tags.map(function (item) {
          return item.text;
        });
        props.onChange(selectedTags);
        return tags;
      });
    };
  },
  handleDelete: function handleDelete(props) {
    return function (index) {
      logger.info('handleDelete', index);
      props.updateTags(function (tags) {
        tags.splice(index, 1);
        var selectedTags = tags.map(function (item) {
          return item.text;
        });
        props.onChange(selectedTags);
        return tags;
      });
    };
  },
  handleAddition: function handleAddition(props) {
    return function (tag) {
      logger.info('handleAddition', tag);
      props.updateTags(function (tags) {
        tags.push({
          id: tags.length + 1,
          text: tag
        });
        var selectedTags = tags.map(function (item) {
          return item.text;
        });
        props.onChange(selectedTags);
        return tags;
      });
    };
  }
}), (0, _recompose.lifecycle)({
  componentDidMount: function componentDidMount() {
    logger.warn('componentDidMount', this.props);
    if (this.props.terms.length > 0 && this.props.tags.length === 0) {
      this.props.changeTags(this.props.terms);
    }
  }
}), (0, _recompose.onlyUpdateForKeys)(['terms', 'tags']));

exports.default = enhance(SearchBar);