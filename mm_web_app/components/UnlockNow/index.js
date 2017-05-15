/**
*
* UnlockNow
*
*/

import React from 'react'
import PropTypes from 'prop-types'
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
  title: PropTypes.string.isRequired,
  install: PropTypes.func.isRequired
}

export default UnlockNow
