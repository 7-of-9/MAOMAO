/**
*
* GridItem
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import ReactStars from 'react-stars'
import moment from 'moment'
import _ from 'lodash'
import DiscoveryButton from '../../components/DiscoveryButton'
import { guid } from '../../utils/hash'

const MAX_COLORS = 12

function urlTopic (id, topics, onSelectTopic) {
  // TODO: click on name to filter by topic
  let currentTopics = []
  if (topics && topics.length) {
    currentTopics = topics.filter(item => item.urlIds && item.urlIds.indexOf(id) !== -1)
  }
  const items = []
  _.forEach(currentTopics, (topic) => {
    items.push(
      <a key={guid()} onClick={() => { onSelectTopic && onSelectTopic(topic) }}>
        <span className={`tags tags-color-${(topics.indexOf(topic) % MAX_COLORS) + 1}`} rel='tag'>
          <span className='text-tag'>{topic.name}</span>
        </span>
      </a>)
  })
  return (
    <div className='mix-tag'>
      {items}
    </div>
  )
}

/* eslint-disable camelcase */
function GridItem ({ url, maxScore, topics }) {
  const { id, href, img, title, im_score, time_on_tab, hit_utc } = url
  const rate = Math.ceil((im_score / maxScore) * 5)
  let discoveryKeys = []
  if (url && url.suggestions_for_url && url.suggestions_for_url.length) {
    discoveryKeys = _.map(url.suggestions_for_url, 'term_name')
  }
  return (
    <div className='grid-item shuffle-item'>
      <div className='thumbnail-box'>
        <div className='thumbnail'>
          <div className='thumbnail-image'>
            <a href={href} target='_blank'>
              <img src={img && img.indexOf('http') !== -1 ? img : '/static/images/no-image.png'} alt={title} />
            </a>
            {discoveryKeys && discoveryKeys.length > 0 && <DiscoveryButton keys={discoveryKeys.join(',')} />}
          </div>
          <div className='caption'>
            <h4 className='caption-title'>
              <a href={href} target='_blank'>
                {title} ({id})
                </a>
            </h4>
            <p>
              <i className='fa fa-bolt' /> Earned: <span className='nlp_score'>{href.length} XP</span>
            </p>
            <p className='para-date'>
              <span className='date-time'>
                <i className='fa fa-clock-o' /> Time on page: {moment.duration(time_on_tab).humanize()}
              </span>
            </p>
            <p className='para-date'>
              <span className='date-time'>
                <i className='fa fa-calendar-o' /> Last visited: {moment.utc(hit_utc).fromNow()}
              </span>
            </p>
            <div className='rating'>
              <ReactStars edit={false} size={22} count={5} value={rate} />
            </div>
            {urlTopic(id, topics)}
          </div>
        </div>
      </div>
    </div>
  )
}

GridItem.propTypes = {
  url: PropTypes.object.isRequired,
  topics: PropTypes.array.isRequired,
  maxScore: PropTypes.number.isRequired
}

export default GridItem
