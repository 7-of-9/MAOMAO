/**
*
* StreamList
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

function StreamList ({ topics, currentTopic, onChange }) {
  const items = []
  if (topics && topics.length) {
    _.forEach(topics, (topic) => {
      if (topic && topic.term_id) {
        items.push(<a className='stream-item' href='#'
          onClick={(e) => {
            e.preventDefault()
            onChange(topic.term_id)
          }} key={topic.term_id}
        >
          <span className={`${currentTopic === topic.term_id ? 'active' : ''}`} >
            {topic.term_name} ({topic.url_ids.length})
          </span>
        </a>)
      }
    })
  }
  return (
    <div className='stream-list'>
      {items}
    </div>
  )
}

StreamList.propTypes = {
  topics: PropTypes.array.isRequired,
  currentTopic: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
}

export default StreamList
