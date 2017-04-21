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
      <img className="logo-image" onClick={() => { window.location.href = '/' }} src='/static/images/maomao.png' alt='maomao' width='165' height='24' />
      <span className='paragraph-smarter'> get smarter </span>
    </Wrapper>
  )
}

Slogan.propTypes = {

}

export default Slogan
