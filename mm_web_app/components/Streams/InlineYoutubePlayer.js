/**
*
* YoutubePlayer
*
*/

import React, { PureComponent } from 'react'
import { inject, observer } from 'mobx-react'
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

function playVideo (player) {
  player.mute()
  player.playVideo()
}

function pauseVideo (player) {
  player.pauseVideo()
}

function handleClick (event, url, player) {
  if (event.shiftKey || event.ctrlKey || event.metaKey) {
    window.open(url, '_blank')
  } else if (player) {
    player.playVideo()
  }
}

@inject('ui')
@observer
class InlineYoutubePlayer extends PureComponent {
  render () {
    /* eslint-disable camelcase */
    const { href, title, url_id, owners, users, topics, myUrlIds, deepestTopics, parseDomain, urlTopic, urlOwner, onPreview } = this.props
    const opts = {
      height: '220',
      width: '100%',
      playerVars: {
        autoplay: 0
      }
    }
    return (
      <div className='thumbnail'
        onMouseEnter={() => { this.ytb && playVideo(this.ytb) }}
        onMouseLeave={() => { this.ytb && pauseVideo(this.ytb) }}
        >
        <div className='thumbnail-image'>
          <YouTube
            videoId={YouTubeGetID(href)}
            opts={opts}
            onReady={(event) => { this.ytb = event.target }}
            />
          {urlTopic(url_id, topics, (topic) => this.props.ui.selectTopic(topic), myUrlIds, (topic) => this.props.ui.openShareTopic(url_id, topic, deepestTopics))}
        </div>
        <div className='caption'>
          <h4 className='caption-title'>
            <a onClick={(evt) => { onPreview() && handleClick(evt, href, this.ytb) }}>
              {title} ({url_id})
            </a>
          </h4>
          <h5 className='caption-title'>{parseDomain(href)}</h5>
          {urlOwner(owners.filter(item => item.url_id === url_id), users, (user) => this.props.ui.selectUser(user))}
        </div>
      </div>
    )
  }
}

export default InlineYoutubePlayer
