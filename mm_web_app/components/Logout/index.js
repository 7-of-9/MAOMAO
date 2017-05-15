/**
*
* Logout
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Button = styled.button`
  padding: 0.5em
  width: 130px
  background-color: #009688
  color: #fff
  border-radius: 2px
  border: 2px solid #000
`

function Logout ({ onLogout }) {
  return (
    <Button onClick={onLogout}>Sign Out</Button>
  )
}

Logout.propTypes = {
  onLogout: PropTypes.func.isRequired
}

export default Logout
