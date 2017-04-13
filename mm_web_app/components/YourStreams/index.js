/**
*
* YourStreams
*
*/

import React from 'react'
import styled from 'styled-components'
import _ from 'lodash'

const Wrapper = styled.div`
  float: left;
  width: 25%;
  padding: 1em 0;
`

const TopicList = styled.ul`
  list-style: none;
  padding: 0;
  text-align: center;
`

const TopicName = styled.li`
  background: #009688;
  color: #fff;
  padding: 1em 0;
  margin-bottom: 0.5em;
  &:hover {
    background: #9e9e9e;
    color: #000;
    cursor: pointer;
  }
`

const Link = styled.a`
  width: 100%;
`

function YourStreams ({ topics, friends, changeTerm, changeFriendStream, activeId }) {
  const items = []
  const friendStreams = []
  if (topics && topics.length) {
    _.forEach(topics, (topic) => {
      if (topic.term_id) {
        items.push(<TopicName
          onClick={(e) => {
            e.preventDefault()
            changeTerm(topic.term_id)
          }} style={{ color: (activeId === topic.term_id) ? '#000' : '#fff' }} key={topic.term_id}
        >
          <Link>
            {topic.term_name} ({topic.url_ids.length})
            </Link>
        </TopicName>)
      }
    })
  }
  if (friends && friends.length) {
    _.forEach(friends, (friend) => {
      if (friend.user_id) {
        friendStreams.push(<TopicName
          onClick={(e) => {
            e.preventDefault()
            changeFriendStream(friend.user_id)
          }} style={{ color: (activeId === friend.user_id) ? '#000' : '#fff' }} key={friend.user_id}
        >
          <Link>
            {friend.fullname}
          </Link>
        </TopicName>)
      }
    })
  }

  return (
    <Wrapper>
      <h1>Your Streams</h1>
      <TopicList>
        {items}
      </TopicList>
      { friends && friends.length > 0 && <h1>Friend Streams</h1> }
      <TopicList>
        {friendStreams}
      </TopicList>
    </Wrapper>
  )
}

YourStreams.propTypes = {
  topics: React.PropTypes.array,
  friends: React.PropTypes.array,
  activeId: React.PropTypes.number,
  changeTerm: React.PropTypes.func,
  changeFriendStream: React.PropTypes.func
}

export default YourStreams
