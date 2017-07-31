/**
*
* TopicTree
*
*/

import React, { PureComponent } from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import _ from 'lodash'
import TopicItem from './TopicItem'
import GridView from '../../components/GridView'
import logger from '../../utils/logger'

@inject('store')
@inject('ui')
@observer
class TopicTree extends PureComponent {
  onChange = (isSelect, topicId, title) => {
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
          img={`https://placeimg.com/320/240/${title}`}
          />
        )
    })
    return (
      <div className='topic-tree'>
        <GridView>
          {items}
        </GridView>
      </div>
    )
  }
}

export default TopicTree
