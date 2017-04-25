/**
*
* YourStreams
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

function YourStreams ({ topics, changeTerm, activeId }) {
  const items = []
  if (topics && topics.length) {
    _.forEach(topics, (topic) => {
      if (topic && topic.term_id) {
        items.push(<a className="stream-item" href="#"
          onClick={(e) => {
            e.preventDefault()
            changeTerm(topic.term_id)
          }} key={topic.term_id}
        >
          <span className={`${activeId === topic.term_id ? 'active' : ''}`} >
            {topic.term_name} ({topic.url_ids.length})
            </span>
        </a>)
      }
    })
  }
  return (
    <div className='container-fluid'>
      <h1 className="stream-title">Your Streams</h1>
      <div className="stream-list">
        {items}
      </div>
    </div>
  )
}

YourStreams.propTypes = {
  topics: PropTypes.array.isRequired,
  activeId: PropTypes.number.isRequired,
  changeTerm: PropTypes.func.isRequired
}

export default YourStreams
