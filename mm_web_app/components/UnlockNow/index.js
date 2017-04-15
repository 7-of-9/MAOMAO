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

function UnlockNow ({ title, install }) {
  return (
    <Button onClick={install}>{title} </Button>
  )
}

UnlockNow.propTypes = {
  title: React.PropTypes.string.isRequired,
  install: React.PropTypes.func.isRequired
}

export default UnlockNow
