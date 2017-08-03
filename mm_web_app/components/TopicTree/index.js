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

  onSelect = (isSelect, topicId, title) => {
    this.props.ui.toggleSelectTopic(isSelect, topicId, title)
  }

  render () {
    logger.warn('TopicTree render')
    const items = []
    const { tree } = toJS(this.props.store)
    _.forEach(tree, (item) => {
       /* eslint-disable camelcase */
      const { topic_id, topic_name: title } = item
      const isSelect = this.props.ui.selectedTopics.find(item => item.topicId === topic_id)
      items.push(
        <TopicItem
          key={topic_id}
          topic_id={topic_id}
          isSelect={!!isSelect}
          title={title}
          onChange={this.onChange}
          onSelect={this.onSelect}
          img={`https://placeimg.com/320/240/${encodeURI(title)}`}
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
