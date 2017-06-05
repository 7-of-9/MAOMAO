/**
*
* DiscoveryButton
*
*/

import React from 'react'
import PropTypes from 'prop-types'

function DiscoveryButton ({ openDiscoveryMode }) {
  return (
    <a className='btn-discovery' onClick={openDiscoveryMode}>
      <amp-img
        layout='responsive'
        width={16}
        height={16}
        src='/static/images/search-input.png'
        alt='Discovery'
        />
    </a>
  )
}

DiscoveryButton.propTypes = {
  openDiscoveryMode: PropTypes.func.isRequired
}

export default DiscoveryButton
