/**
*
* TopicTree
*
*/

import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import _ from 'lodash'
import TopicItem from './TopicItem'
import logger from '../../utils/logger'

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

const currentTopicTree = (tree, topicId) => {
  if (topicId === '') {
    return tree
  } else {
    const foundTree = _.find(tree, item => item.topic_id === topicId)
    if (foundTree) {
      return foundTree.child_topics
    } else {
      for (let counter = 0; counter < tree.length; counter += 1) {
        const topic = currentTopicTree(tree[counter].child_topics, topicId)
        if (topic) {
          return topic
        }
      }
    }
  }
}

@inject('store')
@inject('ui')
@observer
class TopicTree extends Component {
  componentDidMount () {
    this.props.store.getTopicTree()
  }

  onChange = (isSelect, topicId, title, img) => {
    this.props.ui.toggleSelectTopic(isSelect, topicId, title, img)
  }

  onSelect = (topicId, topicName) => {
    this.props.ui.selectTopicTree(topicId, topicName)
  }

  onBack = () => {
    const { tree } = toJS(this.props.store)
    const { currentTopicId, treeLevel } = toJS(this.props.ui)
    const parentTopic = parentTopicInfo(tree, currentTopicId, treeLevel)
    this.props.ui.selectTopicTree(parentTopic.topic_id, parentTopic.topic_name, -1)
  }

  backButton = () => {
    const { currentTopicId, currentTopicTitle } = toJS(this.props.ui)

    return (
      <div className='navigation-panel'>
        {
          currentTopicId && currentTopicId !== '' &&
          <div className='breadcrum'>
            <button className='btn back-to-parent' onClick={this.onBack}>
              <i className='fa fa-angle-left' aria-hidden='true' />
            </button>
            <span onClick={this.onBack} className='text-topic current-topic-name' style={{color: '#000'}}>{currentTopicTitle}</span>
          </div>
          }
      </div>
    )
  }

  cleanClassName = () => {
    logger.warn('TopicTree cleanClassName', this.animateEl)
    if (this.animateEl) {
      /* global $ */
      $(this.animateEl).removeClass('bounceInLeft animated bounceInRight')
    }
  }

  componentDidUpdate () {
    logger.warn('TopicTree componentDidUpdate')
    setTimeout(() => {
      this.cleanClassName()
    }, 1000)
  }

  render () {
    const items = []
    const { tree } = toJS(this.props.store)
    const { currentTopicId, treeLevel, animationType } = toJS(this.props.ui)
    logger.warn('TopicTree render', currentTopicId, treeLevel)

    _.forEach(currentTopicTree(tree, currentTopicId), (item) => {
       /* eslint-disable camelcase */
      const { topic_id, topic_name: title, img, child_topics } = item
      const isSelect = this.props.ui.selectedTopics.find(item => item.topicId === topic_id)
      items.push(
        <TopicItem
          key={topic_id}
          topic_id={topic_id}
          isSelect={!!isSelect}
          title={title}
          onChange={this.onChange}
          onSelect={this.onSelect}
          hasChild={child_topics.length > 0}
          totals={child_topics.length}
          childTopics={child_topics}
          img={img}
          />
        )
    })
    const animateClassName = animationType === 'LTR' ? `grid-row bounceInLeft animated level-${treeLevel}` : `grid-row bounceInRight animated level-${treeLevel}`
    return (
      <div className='topic-tree'>
        {this.backButton()}
        <div className='main-inner'>
          <div className='container-masonry'>
            <div ref={(el) => { this.animateEl = el }} className={animateClassName}>
              {items}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default TopicTree
