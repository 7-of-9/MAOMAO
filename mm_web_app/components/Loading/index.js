/**
*
* Loading
*
*/

import React, { PropTypes } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  text-align: center;
  margin: 0 auto;
`
function Loading (props) {
  return (
    <Wrapper style={{ display: props.isLoading ? '' : 'none' }}>
      <img alt='Loading' src='/static/images/loading.svg' />
    </Wrapper>
  )
}

Loading.propTypes = {
  isLoading: PropTypes.bool.isRequired
}

export default Loading
