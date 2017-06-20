/**
*
* DiscoveryButton
*
*/

import React from 'react'
import PropTypes from 'prop-types'

function AddToHome ({ onClick }) {
  return (
    <a onClick={onClick} className='add-to-home'>
      <i className='fa fa-plus' aria-hidden />
      <i className='fa fa-2x fa-home' aria-hidden />
    </a>
  )
}

AddToHome.propTypes = {
  onClick: PropTypes.func.isRequired
}

export default AddToHome
