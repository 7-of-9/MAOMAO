/**
*
* DiscoveryButton
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'

function DiscoveryButton ({ keys }) {
  let link = '/discovery'
  if (keys) {
    link = `/discovery?search=${keys}`
  }
  return (
    <Link href={link}>
      <a className='btn-discovery' href={link}>
        <img width='16' height='16' src='/static/images/search-input.png' alt='Discovery' />
      </a>
    </Link>
  )
}

DiscoveryButton.propTypes = {
  keys: PropTypes.string.isRequired
}

export default DiscoveryButton
