/**
*
* YoutubeVideo
*
*/

import React from 'react';
// import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import messages from './messages';

function YoutubeVideo() {
  return (
    <div>
      <FormattedMessage {...messages.header} />
    </div>
  );
}

YoutubeVideo.propTypes = {

};

export default YoutubeVideo;
