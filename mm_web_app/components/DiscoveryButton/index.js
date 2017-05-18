/**
*
* DiscoveryButton
*
*/

import React from 'react'
import PropTypes from 'prop-types'

function DiscoveryButton ({ keys }) {
  let link = '/discovery'
  if (keys) {
    link = `/discovery?search=${keys}`
  }
  return (
    <a className='btn-discovery' target='_blank' href={link}>
      <img width='16' height='16' src='/static/images/search-input.png' alt='Discovery' />
    </a>
  )
}

DiscoveryButton.propTypes = {
  keys: PropTypes.string.isRequired
}

export default DiscoveryButton
