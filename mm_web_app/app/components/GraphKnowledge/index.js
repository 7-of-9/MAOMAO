/**
*
* GraphKnowledge
*
*/

import React from 'react';
// import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import messages from './messages';

function GraphKnowledge() {
  return (
    <div>
      <FormattedMessage {...messages.header} />
    </div>
  );
}

GraphKnowledge.propTypes = {

};

export default GraphKnowledge;
