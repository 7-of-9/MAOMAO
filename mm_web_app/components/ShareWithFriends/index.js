/**
*
* ShareWithFriends
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import { WithContext as ReactTags } from 'react-tag-input'
import logger from '../../utils/logger'

function ShareWithFriends ({ friends }) {
  logger.warn('ShareWithFriends', friends)
  return (<div className='container'>
    <p>Share with:</p>
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
  friends: PropTypes.array.isRequired
}

export default ShareWithFriends
