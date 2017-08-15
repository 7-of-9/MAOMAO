/**
*
* SearchBar
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import OwlCarousel from 'react-owl-carousel'
import { Subscribe } from 'react-subscribe'
import SelectedItem from './SelectedItem'
import eventEmitter from '../../utils/eventEmitter'
import logger from '../../utils/logger'

class SelectedList extends React.PureComponent {
  static propTypes = {
    items: PropTypes.array.isRequired,
    onRemove: PropTypes.func.isRequired
  }

  static defaultProps = {
    items: [],
    onRemove: (id, name, img) => {}
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

  toggleFadeStyle = () => {
    logger.warn('SelectedList toggleFadeStyle')
    /* global $ */
    if (!$('.carousel-nav .owl-prev').hasClass('disabled')) {
      $('.carousel-outer').addClass('previous')
    } else {
      $('.carousel-outer').removeClass('previous')
    }

    if (!$('.carousel-nav .owl-next').hasClass('disabled')) {
      $('.carousel-outer').addClass('next')
    } else {
      $('.carousel-outer').removeClass('next')
    }
  }

  onChanged = (data) => {
    this.toggleFadeStyle()
  }

  componentDidMount () {
    logger.warn('SelectedList componentDidMount')
    this.toggleFadeStyle()
  }

  componentDidUpdate () {
    logger.warn('SelectedList componentDidUpdate')
    this.toggleFadeStyle()
  }

  render () {
    const { items } = this.props
    const settings = {
      navContainerClass: 'carousel-nav owl-nav',
      stageOuterClass: 'carousel-outer owl-stage-outer',
      nav: true,
      autoWidth: true,
      navText: [
        '>',
        '<'
      ]
    }
    return (
      <div className='carousel-wrapper'>
        <Subscribe target={eventEmitter} eventName='carousel' listener={this.onCarousel} />
        <OwlCarousel
          className='owl-theme'
          ref={(el) => { this.slider = el }}
          onChanged={this.onChanged}
          onResized={this.onChanged}
          onRefreshed={this.onChanged}
          {...settings}
          >
          {
          items.map(({name, img, id}) => (
            <div key={`${id}-${name}`}>
              <SelectedItem
                name={name}
                img={img}
                id={id}
                onRemove={this.props.onRemove}
              />
            </div>
          ))
          }
        </OwlCarousel>
      </div>
    )
  }
}

export default SelectedList
