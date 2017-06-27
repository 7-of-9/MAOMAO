/**
*
* YoutubePlayer
*
*/

import React, { PureComponent } from 'react'
import YouTube from 'react-youtube'

function YouTubeGetID (url) {
  var ID = ''
  url = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)
  if (url[2] !== undefined) {
    ID = url[2].split(/[^0-9a-z_-]/i)
    ID = ID[0]
  } else {
    ID = url
  }
  return ID
}

class InlinePlayer extends PureComponent {
  render () {
    /* eslint-disable camelcase */
    const { href, title, url_id, owners, users, topics, myUrlIds, deepestTopics, parseDomain, urlTopic, urlOwner, selectTopic, selectUser, openShareTopic, previewUrl } = this.props
    const opts = {
      height: '220',
      width: '100%',
      playerVars: {
        autoplay: 0
      }
    }
    return (
      <div className='thumbnail'
        onMouseEnter={() => { this.ytb && this.ytb.playVideo() }}
        onMouseLeave={() => { this.ytb && this.ytb.pauseVideo() }}
        >
        <div className='thumbnail-image'>
          <YouTube
            videoId={YouTubeGetID(href)}
            opts={opts}
            onReady={(event) => { this.ytb = event.target }}
            />
          {urlTopic(url_id, topics, (topic) => selectTopic(topic), myUrlIds, (topic) => openShareTopic(url_id, topic, deepestTopics))}
        </div>
        <div className='caption'>
          <h4 className='caption-title'>
            <a onClick={() => previewUrl(href, title)}>
              {title} ({url_id})
            </a>
          </h4>
          <h5 className='caption-title'>{parseDomain(href)}</h5>
          {urlOwner(owners.filter(item => item.url_id === url_id), users, (user) => selectUser(user))}
        </div>
      </div>
    )
  }
}

export default InlinePlayer
