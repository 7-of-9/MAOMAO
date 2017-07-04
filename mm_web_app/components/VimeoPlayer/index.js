/**
*
* VimeoPlayer
*
*/

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Player from '@vimeo/player'
import { truncate } from 'lodash'

const Title = styled.h3`
  font-size: 14px;
  margin: 0;
  padding: 0;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Anchor = styled.a`
  color: #41addd;
  text-decoration: none;
   &:hover {
     color: #6cc0e5;
   }
`

const Description = styled.p`
  font-size: 12px;
  margin: 0;
  padding: 0;
  text-align: left;
`

const Icon = styled.img`
  float: left;
  width: 32px;
  height: 32px;
`

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

class VimeoPlayer extends PureComponent {
  render () {
    const { url, name, description, type } = this.props
    return (
      <div className='thumbnail'
        onMouseEnter={() => { this.iframe && playVideo(this.iframe) }}
        onMouseLeave={() => { this.iframe && pauseVideo(this.iframe) }}
        >
        <div className='thumbnail-image' >
          <iframe
            src={`https://player.vimeo.com/video/${vimeoGetID(url)}`}
            frameBorder='0'
            height='100%'
            width='100%'
            allowFullScreen
            ref={(el) => { this.iframe = el }}
            />
        </div>
        <div className='caption'>
          <Title className='caption-title'>
            <Anchor onClick={(evt) => { handleClick(evt, url, this.iframe) }}>
              {name && <span>{name}</span>}
            </Anchor>
          </Title>
          {description && <Description>{truncate(description, { length: 100, separator: /,? +/ })}</Description>}
          <div className='panel-user panel-credit'>
            <div className='panel-user-img'>
              <span className='credit-user'>
                <Icon src='/static/images/vimeo.png' />
                <span className='panel-user-cnt'>
                  <span className='full-name'>{type}</span>
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

VimeoPlayer.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string
}

export default VimeoPlayer
