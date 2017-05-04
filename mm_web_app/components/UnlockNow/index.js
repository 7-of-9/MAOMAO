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
  color: #fff;
`

function UnlockNow ({ title, install }) {
  return (
    <Button className='btn btn-unlock' onClick={install}>{title} </Button>
  )
}

UnlockNow.propTypes = {
  title: React.PropTypes.string.isRequired,
  install: React.PropTypes.func.isRequired
}

export default UnlockNow
