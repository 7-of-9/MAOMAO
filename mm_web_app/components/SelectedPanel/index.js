/**
*
* Loading
*
*/

import React, { PureComponent } from 'react'
import { observer, inject } from 'mobx-react'
import PropTypes from 'prop-types'
import Sticky from 'react-sticky-el'
import SelectedList from './SelectedList'
import logger from '../../utils/logger'

@inject('store')
@inject('ui')
@observer
class SelectedPanel extends PureComponent {
  static propTypes = {
    items: PropTypes.array.isRequired
  }

  static defaultProps = {
    items: []
  }

  onRemove = (id, name, img) => {
    this.props.ui.toggleSelectTopic(false, id, name, img)
  }

  renderView = (items) => {
    if (!items || items.length === 0) {
      return (
        <h3 className='topic-guide'>
        Select your interests...
        </h3>
      )
    }
    return (<SelectedList items={items} onRemove={this.onRemove} />)
  }

  render () {
    const { items } = this.props
    logger.info('SelectedPanel render', items)
    return (
      <Sticky>
        <div className='selected-panel'>
          {this.renderView(items)}
        </div>
      </Sticky>
    )
  }
}

export default SelectedPanel
