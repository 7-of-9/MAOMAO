/**
*
* YoutubePlayer
*
*/

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import YouTube from 'react-youtube'
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

class YoutubePlayer extends PureComponent {
  render () {
    const { url, name, description, type } = this.props
    const opts = {
      height: '220',
      width: '100%',
      playerVars: {
        autoplay: 0
      }
    }
    return (
      <div
        className='thumbnail'
        onMouseEnter={() => { this.ytb && this.ytb.playVideo() }}
        onMouseLeave={() => { this.ytb && this.ytb.pauseVideo() }}
          >
        <div
          className='thumbnail-image'
            >
          <YouTube
            videoId={url}
            opts={opts}
            onReady={(event) => { this.ytb = event.target }}
              />
        </div>
        <div className='caption'>
          <Title className='caption-title'>
            {name && <span>{name}</span>}
          </Title>
          {description && <Description>{truncate(description, { length: 100, separator: /,? +/ })}</Description>}
          <div className='panel-user panel-credit'>
            <div className='panel-user-img'>
              <span className='credit-user'>
                <Icon src='/static/images/youtube.png' />
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

YoutubePlayer.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string.required,
  url: PropTypes.string
}

export default YoutubePlayer
