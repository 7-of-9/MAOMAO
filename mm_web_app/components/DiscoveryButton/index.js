/**
*
* DiscoveryButton
*
*/

import React from 'react'
import Link from 'next/link'

function DiscoveryButton ({ keys }) {
  let link = '/discovery'
  if (keys) {
    link = `/discovery?search=${keys}`
  }
  return (
    <a className='btn-discovery' href='#'>
      <Link href={link} replace>
        <img width='16' height='16' src='/static/images/discovery-icon.png' alt='Discovery' />
      </Link>
    </a>
  )
}

DiscoveryButton.propTypes = {
  keys: React.PropTypes.string
}

export default DiscoveryButton
