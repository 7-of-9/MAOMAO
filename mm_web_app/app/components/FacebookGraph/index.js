/**
*
* FacebookGraph
*
*/

import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

const Wrapper = styled.section`
  padding: 4em;
  background: #dcc8a7;
`;

function FacebookGraph() {
  return (
    <Wrapper>
      <FormattedMessage {...messages.header} />
    </Wrapper>
  );
}

FacebookGraph.propTypes = {

};

export default FacebookGraph;
