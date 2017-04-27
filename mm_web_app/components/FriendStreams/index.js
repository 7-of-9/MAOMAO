/**
*
* YourStreams
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

function FriendStreams ({ friends, changeFriendStream, activeId }) {
  const items = []
  if (friends && friends.length) {
    _.forEach(friends, (friend) => {
      if (friend && friend.user_id) {
        items.push(<a className='stream-item' href='#'
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
      <div className='stream-list'>
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
