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
        items.push(<a
          onClick={(e) => {
            e.preventDefault()
            changeTerm(topic.term_id)
          }} key={topic.term_id}
        >
          <button className={`${activeId === topic.term_id ? 'btn-primary' : ''}`} >
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
  topics: PropTypes.array.isRequired,
  activeId: PropTypes.number.isRequired,
  changeTerm: PropTypes.func.isRequired
}

export default YourStreams
