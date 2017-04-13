/**
*
* ChromeInstall
*
*/

import React from 'react'
import styled from 'styled-components'
import UnlockNow from '../../components/UnlockNow'

const Wrapper = styled.div`
  text-align: center;
`

const AddToChrome = styled.button`
 margin-left: 40px;
 padding: 0.5em 1em;
 background: #1b7ac5;
 color: #fff;
`

const Share = styled.button`
 margin-left: 1px;
 padding: 0.5em 1em;
 background: #1b7ac5;
 color: #fff;
`

function ChromeInstall ({ title, install, hasInstalled }) {
  return (
    <Wrapper style={{ display: hasInstalled ? 'none' : '' }}>
      <UnlockNow install={install} title={title} hasInstalled={hasInstalled} />
      <AddToChrome onClick={install}><i className='fa fa-plus' aria-hidden='true' /> ADD TO CHROME</AddToChrome>
      <Share><i className='fa fa-share-alt' aria-hidden='true' /></Share>
    </Wrapper>
  )
}

ChromeInstall.propTypes = {
  install: React.PropTypes.func,
  hasInstalled: React.PropTypes.bool.isRequired,
  title: React.PropTypes.string.isRequired
}

export default ChromeInstall
