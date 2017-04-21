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

const Description = styled.p`
  margin-left: 10px;
  margin-top: 30px;
  float: right;
  color: #c0c0c0;
`

function Slogan () {
  return (
    <Wrapper>
      <p className='text-logo'>maomao</p>
      <div className='stamp-logo' />
      <Description className='paragraph-smarter'> get smarter </Description>
    </Wrapper>
  )
}

Slogan.propTypes = {

}

export default Slogan
