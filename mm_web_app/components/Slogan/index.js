/**
*
* Slogan
*
*/

import React from 'react'

function Slogan () {
  return (
    <div style={{margin: '0 16px'}}>
      <img className='logo-image' onClick={() => { window.location.href = '/' }} src='/static/images/maomao.png' alt='maomao' width='165' height='24' />
      <span className='paragraph-smarter'> discover & share </span>
    </div>
  )
}

export default Slogan
