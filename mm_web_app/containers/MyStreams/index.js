/*
 *
 * Home
 *
 */

import React from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import ToggleDisplay from 'react-toggle-display'
import InfiniteScroll from 'react-infinite-scroller'
import _ from 'lodash'
import GridView from '../../components/GridView'
import StreamList from '../../components/StreamList'
import Loading from '../../components/Loading'
import logger from '../../utils/logger'
import { guid } from '../../utils/hash'

const LIMIT = 10

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
        selectedMyStreamUrls = selectedMyStreamUrls.slice(0, (this.props.ui.myStream.page + 1) * LIMIT)
      }
      hasMoreItems = this.props.ui.myStream.page * LIMIT < selectedMyStreamUrls.length
      logger.warn('selectedMyStreamUrls', selectedMyStreamUrls)
      logger.warn('hasMoreItems', hasMoreItems)

      /* eslint-disable camelcase */
      if (accept_shares) {
        logger.warn('accept_shares', accept_shares)
        _.forEach(accept_shares, (user) =>
        friendAcceptedList.push(<li key={guid()} className='share-item'>
          <div className='user-share'>
            <div className='user-share-img'>
              <img width='30' height='30' src={user.avatar || '/static/images/no-image.png'} alt={user.fullname} />
            </div>
            <div className='user-share-cnt'>
              <div className='user-share-inner'>
                <p className='user-info'><span className='share-fullname'>{user.fullname}</span> has unlocked <span className='share-code'>{user.share_code}</span></p>
              </div>
              <a className='btn-unshare' href='#'><i className='fa fa-share-alt' aria-hidden='true'></i> UnShare</a>
            </div>
          </div>
        </li>))
      }
      maxScore = findMaxScore(urls)
    }

    return (
      <div className='mystreams'>
        <h1 className='heading-stream'>Your Streams</h1>
        {friendAcceptedList && friendAcceptedList.length > 0 &&
          <div className='friend-list'>
            <p className='paragraph-descript'>You have shared <span className='number-share'>{friendAcceptedList.length}</span> streams with friends:</p>
            <div className='loading-detail'>
              <button type='button' className='btn btn-share-detail' onClick={() => { this.props.ui.showAcceptInvite = !this.props.ui.showAcceptInvite }}><i className='fa fa-eye' aria-hidden='true'></i> {!this.props.ui.showAcceptInvite ? 'View' : 'Hide'} detail</button>
            </div>
            <ToggleDisplay show={this.props.ui.showAcceptInvite}>
              <ul className='accepted-list'>
                {friendAcceptedList}
              </ul>
            </ToggleDisplay>
          </div>
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
          <GridView topics={sortedTopicByUrls} urls={selectedMyStreamUrls} maxScore={maxScore} />
        </InfiniteScroll>
      </div>
    )
  }
}

export default MyStreams
