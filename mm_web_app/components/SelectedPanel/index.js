/**
*
* Loading
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import SelectedList from './SelectedList'

class SelectedPanel extends React.Component {
  static propTypes = {
    total: PropTypes.number.isRequired,
    items: PropTypes.array.isRequired,
    onRemove: PropTypes.func.isRequired
  }

  static defaultProps = {
    total: 0,
    items: [],
    onRemove: (id, name) => {}
  }

  state = {
    isCollapse: false
  }

  toggleCollapse = (evt) => {
    evt.preventDefault()
    this.setState(prevState => ({ isCollapse: !prevState.isCollapse }))
  }

  render () {
    const { isCollapse } = this.state
    const { total, items } = this.props
    return (
        total > 0 &&
        <div className='selected-panel' style={{ height: isCollapse ? '50px' : 'auto' }}>
          <div className='toolbar'>
            <i className={isCollapse ? 'fa fa-2x fa-toggle-on' : 'fa fa-2x fa-toggle-off'} aria-hidden='true' onClick={this.toggleCollapse} />
          </div>
          { !isCollapse && <SelectedList items={items} onRemove={this.props.onRemove} />}
          {isCollapse && <p>You have selected {total} topics.</p>}
        </div>
    )
  }
}

export default SelectedPanel
