/**
*
* YourStreams
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import * as logger from 'loglevel'

function FriendStreams ({ friends, changeFriendStream, activeId }) {
  const items = []
  logger.warn('friends', friends)
  if (friends && friends.length) {
    _.forEach(friends, (friend) => {
      if (friend && friend.user_id) {
        items.push(<a
          onClick={(e) => {
            e.preventDefault()
            changeFriendStream(friend.user_id)
          }} key={friend.user_id}
        >
          <button className={`${activeId === friend.user_id ? 'btn-primary' : ''}`}>
            {friend.fullname}
          </button>
        </a>)
      }
    })
  }
  return (
    <div className='container-fluid'>
      <h1>Friend Streams</h1>
      {items}
    </div>
  )
}

FriendStreams.propTypes = {
  friends: PropTypes.array.isRequired,
  activeId: PropTypes.number.isRequired,
  changeFriendStream: PropTypes.func.isRequired
}

export default FriendStreams
