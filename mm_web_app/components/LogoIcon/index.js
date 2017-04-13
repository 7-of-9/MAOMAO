/**
*
* LogoIcon
*
*/

import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  background-image: url('/static/images/logo.png');
  background-repeat: no-repeat;
  height: 40px;
  width: 40px;
  background-size: 40px 40px;
  margin-left: 16px;
  margin-right: 16px;
`

function LogoIcon () {
  return (
    <Wrapper />
  )
}

LogoIcon.propTypes = {

}

export default LogoIcon
