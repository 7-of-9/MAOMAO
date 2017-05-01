/**
*
* ShareWithFriends
*
*/

import React from 'react'
import styled from 'styled-components'
import { WithContext as ReactTags } from 'react-tag-input'
import logger from '../../utils/logger'

const Description = styled.p`
  width: 90px;
  float: left;
  line-height: 15px;
`

function ShareWithFriends ({ friends }) {
  logger.warn('ShareWithFriends', friends)
  return (<div className='container'>
    <Description>Share with:</Description>
    <ReactTags
      placeholder={''}
      tags={friends}
      labelField={'name'}
      autofocus={false}
      handleDelete={() => {}}
      handleAddition={() => {}}
        />
  </div>)
}

ShareWithFriends.propTypes = {
  friends: React.PropTypes.array
}

export default ShareWithFriends
