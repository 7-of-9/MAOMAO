/**
*
* SearchBar
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import OwlCarousel from 'react-owl-carousel'
import logger from '../../utils/logger'

class DiscoveryNavigation extends React.PureComponent {
  static propTypes = {
    items: PropTypes.array.isRequired
  }

  static defaultProps = {
    items: []
  }

  onCarousel = (isAdd) => {
    logger.warn('onCarousel', isAdd, this.slider)
    const { items } = this.props
    if (items.length > 0 && isAdd) {
      this.slider.next()
    } else {
      this.slider.prev()
    }
  }

  render () {
    const { items } = this.props
    const settings = {
      navContainerClass: 'carousel-nav owl-nav',
      stageOuterClass: 'carousel-outer owl-stage-outer',
      stageClass: 'carousel-stage owl-stage',
      nav: true,
      autoWidth: true,
      navText: [
        '<',
        '>'
      ]
    }
    return (
      <div className='carousel-wrapper'>
        <OwlCarousel
          className='owl-theme'
          ref={(el) => { this.slider = el }}
          {...settings}
          >
          {
          items.map(({name, img, id}) => (
            <div className='selected-topic' key={`topic-${id}`}
              style={{
                background: `linear-gradient(rgba(0, 0, 0, 0.2),rgba(0, 0, 0, 0.5)), url(${img || '/static/images/no-image.png'})`,
                backgroundSize: 'cover'
              }}>
              <p className='blur-bg'>
                <span className='text-topic'>{name}</span>
              </p>
            </div>
          ))
          }
        </OwlCarousel>
      </div>
    )
  }
}

export default DiscoveryNavigation
