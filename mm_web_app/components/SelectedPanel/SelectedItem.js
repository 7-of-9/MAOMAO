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
    logger.info('SelectedItem', name, id, img)
    return (
      <div className='selected-topic' key={`topic-${id}`}
        style={{
          background: `linear-gradient(rgba(0, 0, 0, 0.2),rgba(0, 0, 0, 0.5)), url(${img || '/static/images/no-image.png'})`,
          backgroundSize: 'cover'
        }}>
        <p className='blur-bg'>
          <span className='text-topic'>{name}</span>
          <a className='btn-box-remove' onClick={() => { this.props.onRemove(id, name, img) }}>
            <i className='fa fa-2x fa-remove' aria-hidden='true' />
          </a>
        </p>
      </div>
    )
  }
}

export default SelectedItem
