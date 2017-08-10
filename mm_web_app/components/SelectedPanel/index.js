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

  onRemove = (id, name, img) => {
    this.props.ui.toggleSelectTopic(false, id, name, img)
  }

  showSignUp = () => {
    this.props.ui.toggleSignIn(true, 'Sign Up')
  }

  render () {
    const { items, total } = this.props
    return (
      <Sticky className='animated fadeInUp'>
        <div className='selected-panel'>
          <p className='text-engine'>
            What kind of things are you interested in…
            {
              total > 0 &&
              <div className='block-button' style={{ textAlign: 'center', display: 'inline-block' }}>
                <button className='btn btn-login' onClick={this.showSignUp}>
                  <i className='fa fa-sign-in' aria-hidden='true' /> Ok! Let’s go
                </button>
              </div>
            }
          </p>
          {items && items.length > 0 && <SelectedList items={items} onRemove={this.onRemove} /> }
        </div>
      </Sticky>
    )
  }
}

export default SelectedPanel
