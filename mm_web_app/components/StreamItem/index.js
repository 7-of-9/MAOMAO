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
    <div className='grid-item'>
      <div className='thumbnail-box'>
        <div className='thumbnail'>
          <div className='thumbnail-image'>
            <a href={href} target='_blank'>
              <img src={img || '/static/images/no-image.png'} alt={title} />
            </a>
          </div>
          <div className='caption'>
            <h4 className='caption-title'>
              <a href={href} target='_blank'>{title} ({id})</a>
            </h4>
            <p> Earned XP <span className='nlp_score'>{href.length}</span> ({moment.duration(time_on_tab).humanize()})</p>
            <div className='rating'>
              <ReactStars edit={false} size={22} count={5} value={rate} />
            </div>
            <span className='date-time'>
              {moment.utc(hit_utc).fromNow()}
            </span>
            {discoveryKeys && discoveryKeys.length > 0 && <DiscoveryButton keys={discoveryKeys.join(',')} /> }
          </div>
          {/* <a className='btn-type-share btn-type-url' href='{href}'>
            <span className='label-name'>Technology</span>
            <span className='type-tag'>68</span>
          </a>
          <a className='btn-type-share btn-type-topic' href='{href}'>
            <span className='label-name'>Television</span>
            <span className='type-tag'>79</span>
          </a>
          <a className='btn-type-share btn-type-all' href='{href}'>
            <span className='label-name'>Arts</span>
            <span className='type-tag'>68</span>
          </a> */}
        </div>
      </div>
    </div>
  )
}

StreamItem.propTypes = {
  url: React.PropTypes.object,
  maxScore: React.PropTypes.number
}

export default StreamItem
