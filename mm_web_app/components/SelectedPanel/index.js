/**
*
* Loading
*
*/

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Sticky from 'react-sticky-el'
import SelectedList from './SelectedList'

class SelectedPanel extends PureComponent {
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

  render () {
    const { total, items } = this.props
    return (
        total > 0 &&
        <Sticky>
          <div className='selected-panel'>
            <div>
              <SelectedList items={items} onRemove={this.props.onRemove} />
              <br />
              <div className='block-button' style={{ textAlign: 'center' }}>
                <button className='btn btn-login' onClick={this.props.showSignUp}>
                  <i className='fa fa-sign-in' aria-hidden='true' /> Ok! Let’s go
                </button>
              </div>
            </div>
          </div>
        </Sticky>
    )
  }
}

export default SelectedPanel
