/**
*
* Imgur
*
*/

import React from 'react';
// import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import messages from './messages';

function Imgur() {
  return (
    <div>
      <FormattedMessage {...messages.header} />
    </div>
  );
}

Imgur.propTypes = {

};

export default Imgur;
