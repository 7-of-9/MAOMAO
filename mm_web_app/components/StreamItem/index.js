/**
*
* StreamItem
*
*/

import React from 'react'
import ReactStars from 'react-stars'
import moment from 'moment'
import _ from 'lodash'
import DiscoveryButton from '../../components/DiscoveryButton'

/* eslint-disable camelcase */
function StreamItem ({ url, maxScore }) {
  const { id, href, img, title, im_score, time_on_tab, hit_utc } = url
  const rate = Math.ceil((im_score / maxScore) * 5)
  let discoveryKeys = []
  if (url && url.suggestions_for_url && url.suggestions_for_url.length) {
    discoveryKeys = _.map(url.suggestions_for_url, 'term_name')
  }
  return (
    <div className='col'>
      <a href={href} target='_blank'>
        <img style={{ maxWidth: '400px', maxHeight: '400px' }} src={img || '/static/images/no-image.png'} alt={title} />
      </a>
      <div class='media-body'>
        <a href={href} target='_blank'>
          <h4 className='mt-0'>{title} ({id})</h4>
        </a>
        <p> Earned XP {href.length} {moment.duration(time_on_tab).humanize()} </p>
        <ReactStars edit={false} size={22} count={5} value={rate} />
        <span>
          {moment(hit_utc).fromNow()}
        </span>
        {discoveryKeys && discoveryKeys.length > 0 && <DiscoveryButton keys={discoveryKeys.join(',')} /> }
      </div>
    </div>
  )
}

StreamItem.propTypes = {
  url: React.PropTypes.object,
  maxScore: React.PropTypes.number
}

export default StreamItem
