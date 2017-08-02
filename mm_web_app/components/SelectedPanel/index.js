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
    total: PropTypes.number.isRequired,
    items: PropTypes.array.isRequired
  }

  static defaultProps = {
    total: 0,
    items: []
  }

  onRemove = (id, name) => {
    this.props.ui.toggleSelectTopic(false, id, name)
  }

  showSignUp = () => {
    this.props.ui.toggleSignIn(true, 'Sign Up')
  }

  render () {
    const { total, items } = this.props
    return (
        total > 0 &&
        <Sticky className='animated fadeInUp'>
          <div className='selected-panel'>
            <div>
              <SelectedList items={items} onRemove={this.onRemove} />
              <br />
              <div className='block-button' style={{ textAlign: 'center' }}>
                <button className='btn btn-login' onClick={this.showSignUp}>
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
