/**
*
* Slogan
*
*/

import React from 'react'
import Router from 'next/router'
import logger from '../../utils/logger'

const redirectToSpecialUrl = (evt, url) => {
  evt.preventDefault()
  if (url && url.length > 0) {
    Router.push({ pathname: '/discover', query: { profileUrl: `/${url}` } }, `/${url}`, { shallow: true })
  } else {
    window.location.href = '/'
  }
}

function Slogan ({ redirectUrl }) {
  logger.info('Slogan redirectUrl', redirectUrl)
  return (
    <div style={{margin: '0 16px'}}>
      <img className='logo-image' onClick={(evt) => redirectToSpecialUrl(evt, redirectUrl)} src='/static/images/maomao.png' alt='maomao' width='165' height='24' />
      <span className='paragraph-smarter'> discover & share </span>
    </div>
  )
}

export default Slogan
