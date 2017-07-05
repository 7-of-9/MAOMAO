/**
*
* InlineVimeoPlayer
*
*/

import React, { PureComponent } from 'react'
import { inject, observer } from 'mobx-react'
import Player from '@vimeo/player'

function vimeoGetID (url) {
  /* global URL */
  const { pathname } = new URL(url)
  return pathname.substr(1)
}

function playVideo (iframe) {
  const player = new Player(iframe)
  player.setVolume(0)
  player.play()
}

function pauseVideo (iframe) {
  const player = new Player(iframe)
  player.pause()
}

function handleClick (event, url, iframe) {
  if (event.shiftKey || event.ctrlKey || event.metaKey) {
    window.open(url, '_blank')
  } else if (iframe) {
    const player = new Player(iframe)
    player.play()
  }
}

@inject('ui')
@observer
class InlineVimeoPlayer extends PureComponent {
  render () {
    /* eslint-disable camelcase */
    const { href, title, url_id, owners, users, topics, myUrlIds, deepestTopics, parseDomain, urlTopic, urlOwner } = this.props
    return (
      <div className='thumbnail'
        onMouseEnter={() => { this.iframe && playVideo(this.iframe) }}
        onMouseLeave={() => { this.iframe && pauseVideo(this.iframe) }}
        >
        <div className='thumbnail-image'>
          <iframe
            src={`https://player.vimeo.com/video/${vimeoGetID(href)}`}
            frameBorder='0'
            height='100%'
            width='100%'
            allowFullScreen
            ref={(el) => { this.iframe = el }}
            />
          {urlTopic(url_id, topics, (topic) => this.props.ui.selectTopic(topic), myUrlIds, (topic) => this.props.ui.openShareTopic(url_id, topic, deepestTopics))}
        </div>
        <div className='caption'>
          <h4 className='caption-title'>
            <a onClick={(evt) => { handleClick(evt, href, this.iframe) }}>
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

export default InlineVimeoPlayer
