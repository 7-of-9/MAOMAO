/**
*
* SearchBar
*
*/

import React, { PropTypes } from 'react';
import { compose, pure, withState, withHandlers, onlyUpdateForKeys } from 'recompose';
import { WithContext as ReactTags } from 'react-tag-input';
import { intlShape, injectIntl } from 'react-intl';
import messages from './messages';

import Form from './Form';
import A from './A';
import { InputWrapper, InputContainer } from './Input';

const TEST_SET_1 = ['Classical music', 'Musical', 'Musical compositions', 'Musical history', '1840s', 'Arts'];
const TEST_SET_2 = ['Hanna-Barbera', 'Warner Bros', 'Cartoon Network', 'Rivalry', 'Anthropomorphism'];
const TEST_SET_3 = ['Chess', 'Traditional games', 'Games', 'Board games', 'Game theory'];
const TEST_SET_4 = ['Human sexuality', 'Auctions', 'Human reproduction', 'Sex', 'Human behavior'];

function SearchBar(props) {
  const { formatMessage } = props.intl;
  console.warn('SearchBar props', props);
  return (
    <Form onSubmit={props.onSearch}>
      <A onClick={() => { props.changeTags(TEST_SET_1); }} className="foo" > Test Set 1 </A> |
      <A onClick={() => { props.changeTags(TEST_SET_2); }} className="foo" > Test Set 2 </A> |
      <A onClick={() => { props.changeTags(TEST_SET_3); }} className="foo" > Test Set 3 </A> |
      <A onClick={() => { props.changeTags(TEST_SET_4); }} className="foo" > Test Set 4 </A> |
      <InputWrapper>
        <InputContainer>
          <ReactTags
            tags={props.terms}
            handleDelete={props.handleDelete}
            handleAddition={props.handleAddition}
            placeholder={formatMessage(messages.placeholder)}
          />
        </InputContainer>
      </InputWrapper>
    </Form>
  );
}

SearchBar.propTypes = {
  intl: intlShape.isRequired,
  onSearch: PropTypes.func.isRequired,
  terms: PropTypes.array,
  handleDelete: PropTypes.func,
  handleAddition: PropTypes.func,
  changeTags: PropTypes.func,
};

const enhance = compose(
  withState('tags', 'updateTags', []),
  withHandlers({
    changeTags: (props) => (newTags) => {
      console.warn('changeTags props', props);
      props.updateTags(() => {
        const tags = [];
        for (let counter = 0; counter < newTags.length; counter += 1) {
          tags.push({
            id: counter + 1,
            text: newTags[counter],
          });
        }
        const selectedTags = tags.map((item) => item.text);
        props.onChange(selectedTags);
        props.onSearch();
        return tags;
      });
    },
    handleDelete: (props) => (index) => {
      console.warn('handleDelete props', props, index);
      props.updateTags(() => {
        const tags = props.terms;
        tags.splice(index, 1);
        const selectedTags = tags.map((item) => item.text);
        props.onChange(selectedTags);
        props.onSearch();
        return tags;
      });
    },
    handleAddition: (props) => (tag) => {
      console.warn('handleAddition props', props, tag);
      props.updateTags(() => {
        const tags = props.terms;
        tags.push({
          id: tags.length + 1,
          text: tag,
        });
        const selectedTags = tags.map((item) => item.text);
        props.onChange(selectedTags);
        props.onSearch();
        return tags;
      });
    },
  }),
);

const OptimizedComponent = pure(enhance(SearchBar));
const HyperOptimizedComponent = onlyUpdateForKeys([
  'terms',
])(OptimizedComponent);


export default injectIntl(HyperOptimizedComponent);
