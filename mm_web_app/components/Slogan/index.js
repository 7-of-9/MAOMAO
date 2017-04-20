/**
*
* Slogan
*
*/

import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
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
      <div className="stamp-logo"></div>
      <Description className='paragraph-smarter'> get smarter </Description>
    </Wrapper>
  )
}

Slogan.propTypes = {

}

export default Slogan
