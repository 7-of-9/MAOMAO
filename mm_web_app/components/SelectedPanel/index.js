/**
*
* Loading
*
*/

import React from 'react'
import PropTypes from 'prop-types'

class SelectedPanel extends React.Component {
  static propTypes = {
    total: PropTypes.number.isRequired
  }

  static defaultProps = {
    total: 0
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
    const { total } = this.props
    return (
        total > 0 &&
        <div className='selected-panel' style={{ height: isCollapse ? '50px' : '300px' }}>
          <div className='toolbar'>
            <i className={isCollapse ? 'fa fa-2 fa-toggle-on' : 'fa fa-toggle-off'} aria-hidden='true' onClick={this.toggleCollapse} />
          </div>
          { !isCollapse && this.props.children}
          {isCollapse && <p>You have selected {total} topics.</p>}
        </div>
    )
  }
}

export default SelectedPanel
