/**
*
* Instagram
*
*/

import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

const Wrapper = styled.section`
  padding: 4em;
  background: #94937a;
`;

function Instagram() {
  return (
    <Wrapper>
      <FormattedMessage {...messages.header} />
    </Wrapper>
  );
}

Instagram.propTypes = {

};

export default Instagram;
