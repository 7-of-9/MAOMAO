/**
*
* Loading
*
*/

import React, { PureComponent } from 'react'
import { observer, inject } from 'mobx-react'
import _ from 'lodash'
import { toJS } from 'mobx'
import PropTypes from 'prop-types'
import Sticky from 'react-sticky-el'
import SelectedList from './SelectedList'

const parentTopicInfo = (tree, topicId, treeLevel) => {
  if (treeLevel <= 2) {
    return { topic_id: '', topic_name: '' }
  } else {
    for (let counter = 0; counter < tree.length; counter += 1) {
      const foundTopicTree = _.find(tree[counter].child_topics, item => item.topic_id === topicId)
      if (foundTopicTree) {
        return tree[counter]
      }
    }
    for (let counter = 0; counter < tree.length; counter += 1) {
      const foundChild = parentTopicInfo(tree[counter].child_topics, topicId, treeLevel)
      if (foundChild) {
        return foundChild
      }
    }
  }
}

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

  onBack = () => {
    const { tree } = toJS(this.props.store)
    const { currentTopicId, treeLevel } = toJS(this.props.ui)
    const parentTopic = parentTopicInfo(tree, currentTopicId, treeLevel)
    this.props.ui.selectTopicTree(parentTopic.topic_id, parentTopic.topic_name, -1)
  }

  renderBackButtonAndSignUp = () => {
    const { currentTopicId, currentTopicTitle } = toJS(this.props.ui)
    const { total } = this.props

    return (
      <div className='bottom-panel'>
        {
          total > 0 &&
          <div className='block-button' style={{ textAlign: 'center' }}>
            <button className='btn btn-login' onClick={this.showSignUp}>
              <i className='fa fa-sign-in' aria-hidden='true' /> Ok! Let’s go
            </button>
          </div>
        }
        {
          currentTopicId && currentTopicId !== '' &&
          <div className='breadcrum'>
            <button className='btn back-to-parent' onClick={this.onBack}>
              <i className='fa fa-angle-left' aria-hidden='true' />
            </button>
            <span className='text-topic current-topic-name' style={{color: '#000'}}>{currentTopicTitle}</span>
          </div>
          }
      </div>
    )
  }

  render () {
    const { items } = this.props
    return (
      <Sticky className='animated fadeInUp'>
        <div className='selected-panel'>
          <div>
            <p className='text-engine'>
            To get started, please tell <img className='logo-image' src='/static/images/maomao.png' alt='maomao' /> what kind of things are you interested in…
            </p>
            {items && items.length > 0 && <SelectedList items={items} onRemove={this.onRemove} /> }
            {
              this.renderBackButtonAndSignUp()
            }
          </div>
        </div>
      </Sticky>
    )
  }
}

export default SelectedPanel
