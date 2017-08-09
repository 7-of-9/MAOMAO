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

const currentTopicTree = (tree, topicId) => {
  logger.warn('currentTopicTree tree, topicId', tree, topicId)
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

const parentTopicId = (tree, topicId, treeLevel) => {
  logger.warn('parentTopicId tree, topicId', tree, topicId)
  if (treeLevel <= 2) {
    return ''
  } else {
    for (let counter = 0; counter < tree.length; counter += 1) {
      const foundTopicTree = _.find(tree[counter].child_topics, item => item.topic_id === topicId)
      if (foundTopicTree) {
        return tree[counter].topic_id
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

  onChange = (isSelect, topicId, title) => {
    this.props.ui.toggleSelectTopic(isSelect, topicId, title)
  }

  onSelect = (topicId) => {
    this.props.ui.selectTopicTree(topicId)
  }

  onBack = () => {
    const { tree } = toJS(this.props.store)
    const { currentTopicId, treeLevel } = toJS(this.props.ui)
    this.props.ui.selectTopicTree(parentTopicId(tree, currentTopicId, treeLevel), -1)
  }

  render () {
    const items = []
    const { tree } = toJS(this.props.store)
    const { currentTopicId, treeLevel } = toJS(this.props.ui)
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
          img={img}
          />
        )
    })
    return (
      <div className='topic-tree'>
        {
          currentTopicId && currentTopicId !== '' &&
          <button className='btn btn-back' onClick={this.onBack}>
            <i className='fa fa-angle-left' aria-hidden='true' />
          </button>
        }
        <div className='main-inner'>
          <div className='container-masonry'>
            <div className='grid-row'>
              {items}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default TopicTree
