/**
*
* BlockElement
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
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

function BlockElement ({url, image, name, description, type}) {
  return (
    <Wrapper className='thumbnail-box'>
      <div className='thumbnail'>
        <div className='thumbnail-image'>
          <Anchor href={url} target='_blank'>
            <Image src={image} alt={name} />
          </Anchor>
        </div>
        <div className='caption'>
          {name && <Title className='caption-title'>{name}</Title>}
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

export default BlockElement
