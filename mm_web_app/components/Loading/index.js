/**
*
* Loading
*
*/

import React, { PropTypes } from 'react'

function Loading (props) {
  return (
    <div style={{ display: props.isLoading ? '' : 'none' }} className='bounce-loading'>
      <div className='bounceball'>
        <img src='/static/images/logo.png' alt='maomao' />
      </div>
      <div className='text-loading'>
        <span>L</span>
        <span>o</span>
        <span>a</span>
        <span>d</span>
        <span>i</span>
        <span>n</span>
        <span>g</span>
      </div>
    </div>
  )
}

Loading.propTypes = {
  isLoading: PropTypes.bool.isRequired
}

export default Loading
