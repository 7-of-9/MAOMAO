/**
*
* FacebookGraph
*
*/

import React from 'react';
// import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import messages from './messages';

function FacebookGraph() {
  return (
    <div>
      <FormattedMessage {...messages.header} />
    </div>
  );
}

FacebookGraph.propTypes = {

};

export default FacebookGraph;
