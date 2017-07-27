/**
*
* TopicTree
*
*/

import React from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import _ from 'lodash'
import TopicItem from './TopicItem'
import GridView from '../../components/GridView'
import logger from '../../utils/logger'

@inject('store')
@inject('ui')
@observer
class TopicTree extends React.PureComponent {
  render () {
    logger.warn('TopicTree render')
    const items = []
    const { tree } = toJS(this.props.store)
    _.forEach(tree, (item) => {
       /* eslint-disable camelcase */
      const { topic_id, topic_name: title } = item
      items.push(
        <TopicItem
          key={topic_id}
          topic_id={topic_id}
          title={title}
          img={'http://via.placeholder.com/270x200'}
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
