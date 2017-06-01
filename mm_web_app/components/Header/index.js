/**
*
* Header
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  float: none;
  margin-left: 0;
  margin-right: 0;
  padding-right: 0;
  width: auto;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  padding: 12px 16px;
`

function Header (props) {
  return (
    <Wrapper className='logo'> {props.children}</Wrapper>
  )
}

Header.propTypes = {
  children: PropTypes.node.isRequired
}

export default Header
