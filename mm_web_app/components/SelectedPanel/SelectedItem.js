/**
*
* SearchBar
*
*/

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import logger from '../../utils/logger'

class SelectedItem extends PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    img: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    onRemove: PropTypes.func.isRequired
  }

  static defaultProps = {
    img: '',
    name: '',
    id: 0,
    onRemove: (id, name, img) => {}
  }

  render () {
    const { name, id, img } = this.props
    logger.warn('SelectedItem', name, id, img)
    return (
      <div className={`selected-topic`} key={`topic-${id}`}
        style={{
          backgroundImage: `url(${img || '/static/images/no-image.png'})`,
          backgroundSize: 'cover',
          opacity: '0.6'
        }}>
        <span className='text-topic'>{name}</span>
        <a className='btn-box-remove' onClick={() => { this.props.onRemove(id, name, img) }}>
          <i className='fa fa-remove' aria-hidden='true' />
        </a>
      </div>
    )
  }
}

export default SelectedItem
