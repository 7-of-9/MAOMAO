/**
*
* Loading
*
*/

import React from 'react'
import PropTypes from 'prop-types'

function Loading (props) {
  return (
    <div style={{ display: props.isLoading ? '' : 'none', textAlign: 'center', margin: '0 auto' }}>
      <amp-img
        layout='fixed'
        src='/static/images/balls.svg'
        alt='loading'
        />
    </div>
  )
}

Loading.propTypes = {
  isLoading: PropTypes.bool.isRequired
}

export default Loading
