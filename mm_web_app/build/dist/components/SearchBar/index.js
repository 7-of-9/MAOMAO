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

var _Form = require('./Form');

var _Form2 = _interopRequireDefault(_Form);

var _A = require('./A');

var _A2 = _interopRequireDefault(_A);

var _Input = require('./Input');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TEST_SET_1 = ['Classical music', 'Musical', 'Musical compositions', 'Musical history', '1840s', 'Arts'];
var TEST_SET_2 = ['Hanna-Barbera', 'Warner Bros', 'Cartoon Network', 'Rivalry', 'Anthropomorphism'];
var TEST_SET_3 = ['Chess', 'Traditional games', 'Games', 'Board games', 'Game theory'];
var TEST_SET_4 = ['Human sexuality', 'Auctions', 'Human reproduction', 'Sex', 'Human behavior'];

function SearchBar(props) {
  return _react2.default.createElement(_Form2.default, { onSubmit: props.onSearch }, _react2.default.createElement(_A2.default, { onClick: function onClick() {
      props.changeTags(TEST_SET_1);
    }, className: 'foo' }, ' Test Set 1 '), ' |', _react2.default.createElement(_A2.default, { onClick: function onClick() {
      props.changeTags(TEST_SET_2);
    }, className: 'foo' }, ' Test Set 2 '), ' |', _react2.default.createElement(_A2.default, { onClick: function onClick() {
      props.changeTags(TEST_SET_3);
    }, className: 'foo' }, ' Test Set 3 '), ' |', _react2.default.createElement(_A2.default, { onClick: function onClick() {
      props.changeTags(TEST_SET_4);
    }, className: 'foo' }, ' Test Set 4 '), ' |', _react2.default.createElement(_Input.InputWrapper, null, _react2.default.createElement(_Input.InputContainer, null, _react2.default.createElement(_reactTagInput.WithContext, {
    tags: props.terms,
    handleDelete: props.handleDelete,
    handleAddition: props.handleAddition,
    placeholder: 'Search:'
  }))));
}

var enhance = (0, _recompose.compose)((0, _recompose.withState)('tags', 'updateTags', []), (0, _recompose.withHandlers)({
  changeTags: function changeTags(props) {
    return function (newTags) {
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
        props.onSearch();
        return tags;
      });
    };
  },
  handleDelete: function handleDelete(props) {
    return function (index) {
      props.updateTags(function () {
        var tags = props.terms;
        tags.splice(index, 1);
        var selectedTags = tags.map(function (item) {
          return item.text;
        });
        props.onChange(selectedTags);
        props.onSearch();
        return tags;
      });
    };
  },
  handleAddition: function handleAddition(props) {
    return function (tag) {
      props.updateTags(function () {
        var tags = props.terms;
        tags.push({
          id: tags.length + 1,
          text: tag
        });
        var selectedTags = tags.map(function (item) {
          return item.text;
        });
        props.onChange(selectedTags);
        props.onSearch();
        return tags;
      });
    };
  }
}), (0, _recompose.onlyUpdateForKeys)(['terms']));

exports.default = enhance(SearchBar);