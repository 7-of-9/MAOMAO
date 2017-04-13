/**
*
* DiscoveryButton
*
*/

import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'

const Wrapper = styled.div`
  margin: 0 10px;
  float: right;
`

const Image = styled.img`
  width: 40px;
  height: 40px;
`

function DiscoveryButton ({ keys }) {
  let link = '/discovery'
  if (keys) {
    link = `/discovery?search=${keys}`
  }
  return (
    <Wrapper>
      <Link to={link}>
        <Image src='/static/images/discovery-icon.png' alt='Discovery' />
      </Link>
    </Wrapper>
  )
}

DiscoveryButton.propTypes = {
  keys: React.PropTypes.string
}

export default DiscoveryButton
