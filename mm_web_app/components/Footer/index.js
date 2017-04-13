/**
*
* Footer
*
*/

import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  margin: 0 auto;
  text-align: center;
  height: 100px;
`

const FooterLogo = styled.img`
  color: #7d7b6f;
`

const Description = styled.span`
  margin-left: 10px;
  font-size: 17px;
  color: #c0c0c0;
  font-weight: lighter;
`

function Footer () {
  return (
    <Wrapper>
      <FooterLogo src='/static/images/maomao.png' />
      <Description>the smarter way to share</Description>
    </Wrapper>
  )
}

export default Footer
