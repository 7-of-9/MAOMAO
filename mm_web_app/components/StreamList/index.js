/**
*
* StreamList
*
*/

import React from 'react'
import _ from 'lodash'
import StreamItem from '../../components/StreamItem'

function StreamList ({ urls }) {
  const items = []
  if (urls && urls.length) {
    const maxScore = _.maxBy(urls, 'im_score')
    const sortedUrlsByHitUTC = _.reverse(_.sortBy(urls, [(url) => url.hit_utc]))
    items.push(<div key={Date.now() + 1} style={{ clear: 'both' }} />)
    _.forEach(sortedUrlsByHitUTC, (item) => {
      items.push(<StreamItem key={item.id} url={item} maxScore={maxScore.im_score} />)
    })
  }
  return (
    <div className='row'>
      {items}
    </div>
  )
}

StreamList.propTypes = {
  urls: React.PropTypes.array
}

export default StreamList
