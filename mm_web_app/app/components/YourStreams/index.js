/**
*
* YourStreams
*
*/

import React from 'react';
import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import messages from './messages';

const Wrapper = styled.div`
  float: left;
  width: 20%;
  padding: 1em;
  backgroundColor: #aaa;
`;

function YourStreams() {
  return (
    <Wrapper>
      <FormattedMessage {...messages.header} />
    </Wrapper>
  );
}

YourStreams.propTypes = {

};

export default YourStreams;
