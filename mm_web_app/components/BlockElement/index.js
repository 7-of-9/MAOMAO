/**
*
* BlockElement
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import { compose, withHandlers } from 'recompose'
import styled from 'styled-components'
import YouTube from 'react-youtube'
import { truncate } from 'lodash'

const Wrapper = styled.section`
  padding: 10px;
  border-radius: 6px;
  &:after {
      content: '';
      display: block;
      clear: both;
  }
`

const Anchor = styled.a`
  color: #41addd;
  text-decoration: none;
   &:hover {
     color: #6cc0e5;
   }
`

const Image = styled.img`
  margin-bottom: 10px;
  border-radius: 8px;
  vertical-align: middle;
  margin: 0 auto;
  display: block;
`

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

function iconType (type) {
  switch (type) {
    case 'Google Knowledge':
      return '/static/images/google-knowledge-graph.png'
    case 'Google News':
      return '/static/images/google-news.png'
    case 'Youtube':
      return '/static/images/youtube.png'
    case 'Reddit':
      return '/static/images/reddit.png'
    default:
      return '/static/images/google.png'
  }
}

const enhance = compose(
  withHandlers({
    openUrl: (props) => (url, name) => {
      /* global $ */
      // Close only the currently active or all fancyBox instances
      $.fancybox.close()
      // Open the fancyBox right away
      $.fancybox.open({
        src: url,
        type: 'iframe',
        opts: {
          caption: name
        }
      })
    }
  })
)

function BlockElement ({
  show, url, image, name, description, type,
  openUrl
}) {
  const opts = {
    height: '220',
    width: '100%',
    playerVars: {
      autoplay: 0
    }
  }
  return (
    <Wrapper className='thumbnail-box'>
      {type === 'Youtube' &&
        <div className='thumbnail'>
          <div className='thumbnail-image'>
            <YouTube
              videoId={url}
              opts={opts}
              onReady={(event) => { event.target.pauseVideo() }}
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
                  <Icon src={iconType(type)} />
                  <span className='panel-user-cnt'>
                    <span className='full-name'>{type}</span>
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
        }
      {
        type !== 'Youtube' &&
        <div className='thumbnail'>
          <div className='thumbnail-image'>
            <Anchor className='thumbnail-overlay' onClick={() => openUrl(url, name)}>
              <Image src={image} alt={name} />
            </Anchor>
          </div>
          <div className='caption'>
            <Title className='caption-title'>
              <Anchor onClick={() => openUrl(url, name)}>
                {name && <span>{name}</span>}
              </Anchor>
            </Title>
            {description && <Description>{truncate(description, { length: 100, separator: /,? +/ })}</Description>}
            <div className='panel-user panel-credit'>
              <div className='panel-user-img'>
                <span className='credit-user'>
                  <Icon src={iconType(type)} />
                  <span className='panel-user-cnt'>
                    <span className='full-name'>{type}</span>
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      }
    </Wrapper>
  )
}

BlockElement.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string.required,
  url: PropTypes.string
}

export default enhance(BlockElement)
