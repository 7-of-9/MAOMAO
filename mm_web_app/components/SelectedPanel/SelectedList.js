/**
*
* SearchBar
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import Slider from 'react-slick'
import { Subscribe } from 'react-subscribe'
import SelectedItem from './SelectedItem'
import eventEmitter from '../../utils/eventEmitter'
import logger from '../../utils/logger'

function NextArrow (props) {
  const {className, style, onClick} = props
  return (
    <div style={{
      position: 'absolute',
      right: '0',
      top: '0',
      zIndex: 1,
      height: '50px',
      width: '110px',
      backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgb(255, 255, 255) 90%)'
    }}>
      <div
        className={`${className} carousel-arrow`}
        style={{...style, right: '-20px'}}
        onClick={onClick}
      />
    </div>
  )
}

function PrevArrow (props) {
  const {className, style, onClick} = props
  return (
    <div style={{
      position: 'absolute',
      left: '0',
      top: '0',
      zIndex: 1,
      height: '50px',
      width: '110px',
      backgroundImage: 'linear-gradient(to left, rgba(255, 255, 255, 0) 0%, rgb(255, 255, 255) 90%)'
    }}>
      <div
        className={`${className} carousel-arrow`}
        style={{...style, left: '-20px'}}
        onClick={onClick}
     />
    </div>
  )
}

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
      this.slider.slickGoTo(items.length)
    } else {
      this.slider.slickPrev()
    }
  }

  render () {
    const { items } = this.props
    const settings = {
      infinite: false,
      dots: true,
      dotsClass: 'carousel-dots slick-dots',
      swipeToSlide: true,
      draggable: true,
      touchMove: true,
      initialSlide: 0,
      speed: 500,
      responsive: [
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: Math.min(items.length, 2),
            slidesToScroll: Math.min(items.length, 2)
          }
        },
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: Math.min(items.length, 3),
            slidesToScroll: Math.min(items.length, 3)
          }
        }
      ],
      nextArrow: <NextArrow />,
      prevArrow: <PrevArrow />,
      slidesToShow: 4,
      slidesToScroll: 4,
      variableWidth: true
    }
    return (
      <div style={{padding: '0 10px'}}>
        <Subscribe target={eventEmitter} eventName='carousel' listener={this.onCarousel} />
        <Slider ref={(el) => { this.slider = el }} {...settings}>
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
        </Slider>
      </div>
    )
  }
}

export default SelectedList
