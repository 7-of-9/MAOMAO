/**
*
* YourStreams
*
*/

import React from 'react'
import _ from 'lodash'

function YourStreams ({ topics, friends, changeTerm, changeFriendStream, activeId }) {
  const items = []
  if (topics && topics.length) {
    _.forEach(topics, (topic) => {
      if (topic.term_id) {
        items.push(<a
          onClick={(e) => {
            e.preventDefault()
            changeTerm(topic.term_id)
          }} style={{ color: (activeId === topic.term_id) ? '#000' : '#fff' }} key={topic.term_id}
        >
          <button>
            {topic.term_name} ({topic.url_ids.length})
            </button>
        </a>)
      }
    })
  }
  return (
    <div className='container-fluid'>
      <h1>Your Streams</h1>
      {items}
    </div>
  )
}

YourStreams.propTypes = {
  topics: React.PropTypes.array,
  activeId: React.PropTypes.number,
  changeTerm: React.PropTypes.func
}

export default YourStreams
