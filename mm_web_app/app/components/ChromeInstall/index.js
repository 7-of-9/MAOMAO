/**
*
* ChromeInstall
*
*/

import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: absolute;
  top: 40px;
  right: 10px;
`;

const AddToChrome = styled.button`
 padding: 0.5em 1em;
 background: #1b7ac5;
 color: #fff;
`;

const Share = styled.button`
 margin-left: 2px;
 padding: 0.5em 1em;
 background: #1b7ac5;
 color: #fff;
`;


function ChromeInstall({ install, hasInstalled }) {
  return (
    <Wrapper>
      <AddToChrome style={{ display: hasInstalled ? 'none' : '' }} onClick={install}><i className="fa fa-plus" aria-hidden="true" /> ADD TO CHROME</AddToChrome>
      <Share><i className="fa fa-share-alt" aria-hidden="true" /></Share>
    </Wrapper>
  );
}

ChromeInstall.propTypes = {
  install: React.PropTypes.func,
  hasInstalled: React.PropTypes.bool.isRequired,
};

export default ChromeInstall;
