/**
*
* SearchBar
*
*/

import React, { PropTypes } from 'react';
import styled from 'styled-components';

import { intlShape, injectIntl } from 'react-intl';
import messages from './messages';

import searchIcon from './images/search-icon.svg';

const InputWrapper = styled.div`
  background-image: url(${searchIcon});
  background-position: 12px 7px;
  background-repeat: no-repeat;
  background-size: 29px 26px;
  height: 40px;
  width: 100%;
  padding-left: 44px;
  background-color: #efefef;
  border: none;
  border-radius: 4px;
`;

const InputContainer = styled.div`
  text-align: left;
  color: rgb(33, 25, 34);
  height: 40px;
`;

const Input = styled.input`
  padding-left: 52px;
  color: #b5b5b5;
  font-size: 16px;
  font-weight: 600;
  height: 100%;
  line-height: 20px;
  outline: none;
  padding: 0;
  width: 100%;
`;
function SearchBar(props) {
  const { formatMessage } = props.intl;
  return (
    <InputWrapper>
      <InputContainer>
        <Input onChange={props.onChange} placeholder={formatMessage(messages.placeholder)} type="text" />
      </InputContainer>
    </InputWrapper>
  );
}

SearchBar.propTypes = {
  intl: intlShape.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default injectIntl(SearchBar);
