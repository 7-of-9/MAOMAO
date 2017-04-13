/**
*
* UnlockNow
*
*/

import React from 'react'
import styled from 'styled-components'

const Button = styled.button`
  padding: 0.5em;
  background: #0b9803;
  width: 124px;
  color: #fff;
`

function UnlockNow ({ title, install, hasInstalled }) {
  return (
    <Button style={{ display: hasInstalled ? 'none' : '' }} onClick={install}>{title} </Button>
  )
}

UnlockNow.propTypes = {
  title: React.PropTypes.string.isRequired,
  hasInstalled: React.PropTypes.bool.isRequired,
  install: React.PropTypes.func
}

export default UnlockNow
