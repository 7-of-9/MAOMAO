/**
*
* BlockElement
*
*/

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import ReactPlaceholder from 'react-placeholder'
import 'react-placeholder/lib/reactPlaceholder.css'
import { TextBlock, RectShape } from 'react-placeholder/lib/placeholders'
import { truncate } from 'lodash'
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

function awesomePlaceholder () {
  return (
    <div className='media-block'>
      <RectShape color='#CDCDCD' style={{width: 200, height: 120}} />
      <TextBlock rows={3} color='#CDCDCD' />
    </div>
  )
}

class BlockElement extends Component {
  constructor (props) {
    super(props)
    this.state = { ready: false }
  }

  componentDidMount () {
    const { image } = this.props
    logger.warn('BlockElement componentDidMount', image)
    if (image) {
      /* global Image */
      const img = new Image()
      img.onload = () => {
        logger.warn('BlockElement componentDidMount onload', image)
        this.setState({ready: true})
      }
      img.onerror = () => {
        logger.warn('BlockElement componentDidMount onerror', image)
        this.setState({ready: true})
      }
      img.src = image
      logger.warn('BlockElement componentDidMount img', img)
    } else {
      this.setState({ready: true})
    }
  }

  render () {
    const { url, image, name, description, type } = this.props
    logger.info('BlockElement render', url, image, type)
    return (
      <Wrapper className='thumbnail-box'>
        {
          type === 'Youtube' &&
          <YoutubePlayer {...this.props} />
        }
        {
        type !== 'Youtube' &&
        <ReactPlaceholder
          showLoadingAnimation
          customPlaceholder={awesomePlaceholder()}
          ready={this.state.ready}>
          <div className='thumbnail'>
            <div className='thumbnail-image'>
              <Anchor className='thumbnail-overlay' onClick={() => previewUrl(url, name)}>
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
        </ReactPlaceholder>
      }
      </Wrapper>
    )
  }
}

BlockElement.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string
}

export default BlockElement
