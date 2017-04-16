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
    <div>
      <Link href={link} replace>
        <img width='40' height='40' src='/static/images/discovery-icon.png' alt='Discovery' />
      </Link>
    </div>
  )
}

DiscoveryButton.propTypes = {
  keys: React.PropTypes.string
}

export default DiscoveryButton
