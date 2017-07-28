/**
*
* SearchBar
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import logger from '../../utils/logger'
import { tagColor } from '../../utils/helper'

class SelectedItem extends React.PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    onRemove: PropTypes.func.isRequired
  }

  static defaultProps = {
    name: '',
    id: 0,
    onRemove: (id, name) => {}
  }

  render () {
    const { name, id } = this.props
    logger.warn('SelectedItem')
    return (
      <li className={tagColor(name)} key={`topic-${id}`}>
        <span className='text-topic'>{name}</span>
        <a className='btn-box-remove' onClick={() => { this.props.onRemove(id, name) }}>
          <i className='fa fa-remove' aria-hidden='true' />
        </a>
      </li>
    )
  }
}

export default SelectedItem
