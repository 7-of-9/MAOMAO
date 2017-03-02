/**
*
* SearchBar
*
*/

import React, { PropTypes } from 'react';
import { compose, pure, withState, withHandlers } from 'recompose';
import { WithContext as ReactTags } from 'react-tag-input';
import { intlShape, injectIntl } from 'react-intl';
import messages from './messages';

import Form from './Form';
import { InputWrapper, InputContainer } from './Input';

function SearchBar(props) {
  const { formatMessage } = props.intl;
  return (
    <Form onSubmit={props.onSearch}>
      <InputWrapper>
        <InputContainer>
          <ReactTags
            tags={props.tags}
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
  tags: PropTypes.any,
  handleDelete: PropTypes.func,
  handleAddition: PropTypes.func,
};

const enhance = compose(
  withState('tags', 'updateTags', []),
  withHandlers({
    handleDelete: (props) => (index) => {
      props.updateTags((tags) => {
        tags.splice(index, 1);
        const selectedTags = tags.map((item) => item.text);
        props.onChange(selectedTags.join(' '));
        props.onSearch();
        return tags;
      });
    },
    handleAddition: (props) => (tag) => {
      props.updateTags((tags) => {
        tags.push({
          id: tags.length + 1,
          text: tag,
        });
        const selectedTags = tags.map((item) => item.text);
        props.onChange(selectedTags.join(' '));
        props.onSearch();
        return tags;
      });
    },
  }),
  pure
);

export default injectIntl(enhance(SearchBar));
