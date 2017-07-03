/**
*
* VimeoPlayer
*
*/

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Vimeo from 'react-vimeo'
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

class VimeoPlayer extends PureComponent {
  render () {
    const { url, name, description, type } = this.props
    return (
      <div
        className='thumbnail'
        onMouseEnter={(evt) => { this.vm.playVideo(evt) }}
        onMouseLeave={(evt) => { this.vm.playVideo(evt) }}
          >
        <div
          className='thumbnail-image'
            >
          <Vimeo
            videoId={vimeoGetID(url)}
            ref={(el) => { this.vm = el }}
           />
        </div>
        <div className='caption'>
          <Title className='caption-title'>
            <Anchor onClick={(evt) => { this.vm.playVideo(evt) }}>
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
