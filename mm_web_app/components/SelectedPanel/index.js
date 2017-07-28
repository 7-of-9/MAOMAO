/**
*
* Loading
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import Sticky from 'react-sticky-el'
import SelectedList from './SelectedList'

class SelectedPanel extends React.Component {
  static propTypes = {
    total: PropTypes.number.isRequired,
    items: PropTypes.array.isRequired,
    onRemove: PropTypes.func.isRequired,
    showSignUp: PropTypes.func.isRequired
  }

  static defaultProps = {
    total: 0,
    items: [],
    onRemove: (id, name) => {},
    showSignUp: () => {}
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
        <Sticky>
          <div className='selected-panel' style={{ height: isCollapse ? '50px' : 'auto' }}>
            <div className='toolbar'>
              <i className={isCollapse ? 'fa fa-2x fa-toggle-on' : 'fa fa-2x fa-toggle-off'} aria-hidden='true' onClick={this.toggleCollapse} />
            </div>
            {
            !isCollapse &&
            <div>
              <SelectedList items={items} onRemove={this.props.onRemove} />
              <br />
              <div className='block-button' style={{ textAlign: 'center' }}>
                <button className='btn btn-login' onClick={this.props.showSignUp}>
                  <i className='fa fa-sign-in' aria-hidden='true' /> Ok! Let’s go
                </button>
              </div>
            </div>
          }
            {isCollapse && <p>You have selected {total} topics.</p>}
          </div>
        </Sticky>
    )
  }
}

export default SelectedPanel
