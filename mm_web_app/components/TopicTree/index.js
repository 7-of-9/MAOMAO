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
