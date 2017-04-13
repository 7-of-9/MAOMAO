/**
*
* Slogan
*
*/

import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  background-image: url('/static/images/demo.png');
  background-repeat: no-repeat;
  background-size: 40px 40px;
  margin-left: 16px;
  margin-right: 16px;
`

const MaomaoImage = styled.img`
  margin-left: 0px;
  margin-top: 30px;
  float: left;
  &:hover {
    cursor: pointer;
  }
`

const Description = styled.p`
  margin-left: 10px;
  margin-top: 30px;
  float: right;
  color: #c0c0c0;
`

function Slogan () {
  return (
    <Wrapper>
      <MaomaoImage
        onClick={() => { window.location.href = '/' }} src='/static/images/maomao.png'
      />
      <Description> get smarter </Description>
    </Wrapper>
  )
}

Slogan.propTypes = {

}

export default Slogan
