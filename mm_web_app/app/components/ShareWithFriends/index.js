/**
*
* ShareWithFriends
*
*/

import React from 'react';
import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import messages from './messages';

const Wrapper = styled.div`
  backgroundColor: #abc;
  padding: 1em;
`;

function ShareWithFriends() {
  return (
    <Wrapper>
      <FormattedMessage {...messages.header} />
    </Wrapper>
  );
}

ShareWithFriends.propTypes = {

};

export default ShareWithFriends;
