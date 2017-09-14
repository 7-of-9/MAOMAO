/**
*
* Slogan
*
*/

import React from 'react'
import logger from '../../utils/logger'

const redirectToSpecialUrl = (evt, url) => {
  evt.preventDefault()
  if (url && url.length > 0) {
    window.location.href = `/${url}`
  } else {
    window.location.href = '/'
  }
}

function Slogan ({ redirectUrl }) {
  logger.info('special url', redirectUrl)
  return (
    <div style={{margin: '0 16px'}}>
      <img className='logo-image' onClick={(evt) => redirectToSpecialUrl(evt, redirectUrl)} src='/static/images/maomao.png' alt='maomao' width='165' height='24' />
      <span className='paragraph-smarter'> discover & share </span>
    </div>
  )
}

export default Slogan
