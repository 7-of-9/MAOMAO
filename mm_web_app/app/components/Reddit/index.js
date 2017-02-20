/**
*
* Reddit
*
*/

import React from 'react';
// import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import messages from './messages';

function Reddit() {
  return (
    <div>
      <FormattedMessage {...messages.header} />
    </div>
  );
}

Reddit.propTypes = {

};

export default Reddit;
