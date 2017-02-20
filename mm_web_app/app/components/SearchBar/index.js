/**
*
* SearchBar
*
*/

import React, { PropTypes } from 'react';
import styled from 'styled-components';

import { intlShape, injectIntl, FormattedMessage } from 'react-intl';
import messages from './messages';

const Input = styled.input`
  padding: 0.5em;
  margin: 0.5em;
  color: palevioletred;
  background: papayawhip;
  border: none;
  border-radius: 3px;

  &:hover {
    box-shadow: inset 1px 1px 2px rgba(0,0,0,0.1);
  }
`;

const Button = styled.button`
  /* Adapt the colors based on primary prop */
  background: ${(props) => props.primary ? 'palevioletred' : 'white'};
  color: ${(props) => props.primary ? 'white' : 'palevioletred'};

  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid palevioletred;
  border-radius: 3px;
`;

function SearchBar(props) {
  const { formatMessage } = props.intl;
  return (
    <div>
      <FormattedMessage {...messages.header} />
      <Input placeholder={formatMessage(messages.placeholder)} type="text" />
      <Button primary onClick={props.onClick}><FormattedMessage {...messages.button} /></Button>
    </div>
  );
}

SearchBar.propTypes = {
  intl: intlShape.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default injectIntl(SearchBar);
