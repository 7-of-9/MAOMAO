/**
*
* Loading
*
*/

import React, { PropTypes } from 'react'

function Loading (props) {
  return (
    <div style={{ display: props.isLoading ? '' : 'none', textAlign: 'center', margin: '0 auto' }}>
      <img src='/static/images/balls.svg' alt='loading' />
    </div>
  )
}

Loading.propTypes = {
  isLoading: PropTypes.bool.isRequired
}

export default Loading
