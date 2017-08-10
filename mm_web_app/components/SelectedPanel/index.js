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

  render () {
    const { items } = this.props
    return (
        items.length > 0 &&
        <Sticky>
          <div className='selected-panel'>
            <SelectedList items={items} onRemove={this.onRemove} />
          </div>
        </Sticky>
    )
  }
}

export default SelectedPanel
