/**
*
* FriendStream
*
*/

import React from 'react';
// import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import messages from './messages';

function FriendStream() {
  return (
    <div>
      <FormattedMessage {...messages.header} />
    </div>
  );
}

FriendStream.propTypes = {

};

export default FriendStream;
