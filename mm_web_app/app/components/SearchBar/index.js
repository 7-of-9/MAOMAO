/**
*
* SearchBar
*
*/

import React, { PropTypes } from 'react';

import { intlShape, injectIntl } from 'react-intl';
import messages from './messages';

import Form from './Form';
import { InputWrapper, InputContainer, Input } from './Input';

function SearchBar(props) {
  const { formatMessage } = props.intl;
  return (
    <Form onSubmit={props.onSearch}>
      <InputWrapper>
        <InputContainer>
          <Input onChange={props.onChange} placeholder={formatMessage(messages.placeholder)} type="text" />
        </InputContainer>
      </InputWrapper>
    </Form>
  );
}

SearchBar.propTypes = {
  intl: intlShape.isRequired,
  onChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default injectIntl(SearchBar);
