/**
*
* BlockElement
*
*/

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { truncate } from 'lodash'
import PlaceHolder from '../PlaceHolder'
import YoutubePlayer from '../YoutubePlayer'
import previewUrl from '../../utils/previewUrl'
import logger from '../../utils/logger'

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

const Img = styled.img`
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
    case 'Vimeo':
      return '/static/images/vimeo.png'
    case 'Twitter':
      return '/static/images/twitter.png'
    default:
      return '/static/images/google.png'
  }
}

class BlockElement extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isPreview: false
    }
    this.onPreview = this.onPreview.bind(this)
  }

  onPreview () {
    this.setState({
      isPreview: true
    }, () => { this.props.masonry.layout() })
  }

  render () {
    const { url, image, name, description, type } = this.props
    const { isPreview } = this.state
    logger.info('BlockElement render', url, image, type)
    return (
      <div className={isPreview ? 'grid-item grid-item--full' : 'grid-item'}>
        <Wrapper className='thumbnail-box'>
          {
            type === 'Youtube' &&
            <PlaceHolder image={image}>
              <YoutubePlayer {...this.props} />
            </PlaceHolder>
          }
          {
          type !== 'Youtube' &&
          isPreview &&
          previewUrl(url, name)
          }
          {
              type !== 'Youtube' &&
              !isPreview &&
              <PlaceHolder image={image}>
                <div className='thumbnail'>
                  <div className='thumbnail-image'>
                    <Anchor className='thumbnail-overlay' onClick={this.onPreview}>
                      <Img src={image} alt={name} />
                    </Anchor>
                  </div>
                  <div className='caption'>
                    <Title className='caption-title'>
                      <Anchor onClick={() => previewUrl(url, name)}>
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
              </PlaceHolder>
          }
        </Wrapper>
      </div>
    )
  }
}

BlockElement.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  masonry: PropTypes.object
}

export default BlockElement
