/**
*
* Reddit
*
*/

import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

const Wrapper = styled.section`
  padding: 4em;
  background: #7d7b6f;
`;

function Reddit() {
  return (
    <Wrapper>
      <FormattedMessage {...messages.header} />
    </Wrapper>
  );
}

Reddit.propTypes = {

};

export default Reddit;
