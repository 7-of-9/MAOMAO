/**
*
* Instagram
*
*/

import React from 'react';
// import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import messages from './messages';

function Instagram() {
  return (
    <div>
      <FormattedMessage {...messages.header} />
    </div>
  );
}

Instagram.propTypes = {

};

export default Instagram;
