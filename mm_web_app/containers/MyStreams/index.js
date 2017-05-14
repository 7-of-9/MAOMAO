/*
 *
 * Home
 *
 */

import React from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import _ from 'lodash'
import YourStreams from '../../components/YourStreams'
import StreamList from '../../components/StreamList'
import logger from '../../utils/logger'
import { guid } from '../../utils/hash'

@inject('store')
@inject('ui')
@observer
class MyStreams extends React.PureComponent {
  render () {
    let selectedMyStreamUrls = []
    let sortedTopicByUrls = []
    let currentTermId = this.props.store.currentTermId
    let friendAcceptedList = []
    if (this.props.store.userHistory) {
      const { urls, topics, accept_shares } = toJS(this.props.store.myStream)
      sortedTopicByUrls = _.reverse(_.sortBy(_.filter(topics, (topic) => topic && topic.term_id > 0), [(topic) => topic.url_ids.length]))
      let urlIds = []
      // first for my stream
      if (currentTermId === -1 && sortedTopicByUrls.length > 0) {
        urlIds = sortedTopicByUrls[0].url_ids
        currentTermId = sortedTopicByUrls[0].term_id
      } else {
        const currentTopic = sortedTopicByUrls.find((item) => item.term_id === currentTermId)
        if (currentTopic) {
          urlIds = currentTopic.url_ids
        }
      }

      /* eslint-disable camelcase */
      if (accept_shares) {
        logger.warn('accept_shares', accept_shares)
        _.forEach(accept_shares, (user) =>
        friendAcceptedList.push(<li key={guid()} className='share-item'>
          <span>
            <img width='24' height='24' src={user.avatar || '/static/images/no-image.png'} alt={user.fullname} />
            {user.fullname} has unlocked {user.share_code}
            <a href='#'> UnShare</a>
          </span>
        </li>))
      }

      selectedMyStreamUrls = _.filter(urls, (item) => item.id && urlIds.indexOf(item.id) !== -1)
    }

    return (
      <div>
        <h1> Your Streams </h1>
        {friendAcceptedList && friendAcceptedList.length > 0 &&
          <div className='friend-list'>
            <p>
          You have shared {friendAcceptedList.length} streams with friends:
          </p>
            <ul>
              {friendAcceptedList}
            </ul>
          </div>
        }
        <YourStreams
          topics={sortedTopicByUrls}
          activeId={currentTermId}
          changeTerm={(termId) => { this.props.store.currentTermId = termId }}
        />
        <StreamList urls={selectedMyStreamUrls} />
      </div>
    )
  }
}

export default MyStreams
