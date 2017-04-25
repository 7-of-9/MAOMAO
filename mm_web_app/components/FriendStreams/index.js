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
  logger.info('friends', friends)
  if (friends && friends.length) {
    _.forEach(friends, (friend) => {
      if (friend && friend.user_id) {
        items.push(<a className="stream-item" href="#"
          onClick={(e) => {
            e.preventDefault()
            changeFriendStream(friend.user_id)
          }} key={friend.user_id}
        >
          <span className={`${activeId === friend.user_id ? 'active' : ''}`}>
            {friend.fullname}
          </span>
        </a>)
      }
    })
  }
  return (
    <div className='container-fluid'>
      <h1 className="stream-title">Friend Streams</h1>
      <div className="stream-list">
        {items}
      </div>
    </div>
  )
}

FriendStreams.propTypes = {
  friends: PropTypes.array.isRequired,
  activeId: PropTypes.number.isRequired,
  changeFriendStream: PropTypes.func.isRequired
}

export default FriendStreams
