/*
 *
 * Home
 *
 */

import React from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import Modal from 'react-modal'
import InfiniteScroll from 'react-infinite-scroller'
import _ from 'lodash'
import GridView from '../../components/GridView'
import StreamList from '../../components/StreamList'
import Loading from '../../components/Loading'
import logger from '../../utils/logger'
import { guid } from '../../utils/hash'

const LIMIT = 10

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto'
  }
}

function getUrls (urls, topics, currentTermId) {
  let sortedTopicByUrls = _.reverse(_.sortBy(_.filter(topics, (topic) => topic && topic.term_id > 0), [(topic) => topic.url_ids.length]))
  let urlIds = []

  const currentTopic = sortedTopicByUrls.find((item) => item.term_id === currentTermId)
  logger.warn('currentTopic', currentTopic)
  if (currentTopic) {
    urlIds = currentTopic.url_ids
    return _.filter(urls, (item) => item.id && urlIds.indexOf(item.id) !== -1)
  } else {
    return urls || []
  }
}

function findMaxScore (urls) {
  const score = _.maxBy(urls, 'im_score')
  if (score && score.im_score) {
    return score.im_score
  }
  return 0
}

@inject('store')
@inject('ui')
@observer
class MyStreams extends React.PureComponent {
  render () {
    let maxScore = 0
    let selectedMyStreamUrls = []
    let sortedTopicByUrls = []
    let currentTermId = this.props.ui.myStream.currentTermId
    let friendAcceptedList = []
    let hasMoreItems = false
    if (this.props.store.userHistory) {
      const { urls, topics, accept_shares } = toJS(this.props.store.myStream)
      selectedMyStreamUrls = getUrls(urls, topics, currentTermId)
      sortedTopicByUrls = _.reverse(_.sortBy(_.filter(topics, (topic) => topic && topic.term_id > 0), [(topic) => topic.url_ids.length]))
      if (selectedMyStreamUrls && selectedMyStreamUrls.length) {
        selectedMyStreamUrls = selectedMyStreamUrls.slice(this.props.ui.myStream.page, LIMIT)
      }
      hasMoreItems = this.props.ui.myStream.page * LIMIT <= selectedMyStreamUrls.length
      logger.warn('selectedMyStreamUrls', selectedMyStreamUrls)
      logger.warn('hasMoreItems', hasMoreItems)

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
      maxScore = findMaxScore(urls)
    }

    return (
      <div>
        <h1> Your Streams </h1>
        {friendAcceptedList && friendAcceptedList.length > 0 &&
        <p>
            You have shared {friendAcceptedList.length} streams with friends:
            <a onClick={() => { this.props.ui.openAcceptInviteModal() }}>View detail</a>
        </p>
        }
        <StreamList
          topics={sortedTopicByUrls}
          currentTopic={currentTermId}
          onChange={(termId) => {
            this.props.ui.myStream.currentTermId = termId
            this.props.ui.myStream.page = 0
          }}
        />
        <InfiniteScroll
          pageStart={this.props.ui.myStream.page}
          loadMore={() => { this.props.ui.myStream.page += 1 }}
          hasMore={hasMoreItems}
          loader={<Loading isLoading />}
          threshold={600}
          >
          <GridView urls={selectedMyStreamUrls} maxScore={maxScore} />
        </InfiniteScroll>
        <Modal
          isOpen={this.props.ui.showAcceptInviteModal}
          style={customStyles}
          onRequestClose={() => { this.props.ui.closeAcceptInviteModal() }}
          contentLabel='Friend List'
          portalClassName='QuestionModal'
          >
          <ul>
            {friendAcceptedList}
          </ul>
        </Modal>
      </div>
    )
  }
}

export default MyStreams
