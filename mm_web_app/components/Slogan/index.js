/**
*
* Slogan
*
*/

import React from 'react'

function Slogan () {
  return (
    <div style={{margin: '0 16px'}}>
      <span className='stamp-logo' />
      <amp-img
        layout='fixed'
        className='logo-image'
        onClick={() => { window.location.href = '/' }}
        src='/static/images/maomao.png'
        alt='maomao'
        width='165'
        height='24'
        />
      <span className='paragraph-smarter'> get smarter </span>
    </div>
  )
}

export default Slogan
