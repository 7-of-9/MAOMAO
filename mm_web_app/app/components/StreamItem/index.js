/**
*
* StreamItem
*
*/

import React from 'react';
import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import messages from './messages';

const Wrapper = styled.div`
    background-color: #aaa;
    padding: 1em;
    width: 320px;
    float: left;
    margin: 10px;
`;

function StreamItem() {
  return (
    <Wrapper>
      <FormattedMessage {...messages.header} />
    </Wrapper>
  );
}

StreamItem.propTypes = {

};

export default StreamItem;
