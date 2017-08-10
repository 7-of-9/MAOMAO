/**
*
* SearchBar
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import Slider from 'react-slick'
import SelectedItem from './SelectedItem'

class SelectedList extends React.PureComponent {
  static propTypes = {
    items: PropTypes.array.isRequired,
    onRemove: PropTypes.func.isRequired
  }

  static defaultProps = {
    items: [],
    onRemove: (id, name, img) => {}
  }

  render () {
    const { items } = this.props
    const settings = {
      className: 'slider variable-width',
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: Math.min(items.length, 5),
      slidesToScroll: 3,
      variableWidth: true,
      centerMode: true
    }
    return (
      <Slider {...settings}>
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
    )
  }
}

export default SelectedList
