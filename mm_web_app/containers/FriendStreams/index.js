/**
*
* FriendStreams
*
*/

import React from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import Masonry from 'react-masonry-component'
import InfiniteScroll from 'react-infinite-scroller'
import ReactStars from 'react-stars'
import moment from 'moment'
import _ from 'lodash'
import logger from '../../utils/logger'
import Loading from '../../components/Loading'
import DiscoveryButton from '../../components/DiscoveryButton'
import FilterSearch from '../../components/FilterSearch'
import { guid } from '../../utils/hash'

const LIMIT = 20
const MAX_COLORS = 12
const masonryOptions = {
  itemSelector: '.grid-item',
  transitionDuration: '0.4s'
}

function urlOwner (id, users, onSelectUser) {
  // TODO: click on name to filter by user
  const owners = users.filter(item => item.urlIds.indexOf(id) !== -1)
  const items = []
  _.forEach(owners, owner => {
    items.push(<div key={guid()} className='panel-user-img'>
      <a onClick={() => { onSelectUser(owner) }} className='tooltip-user' title={owner.fullname}>
        <img src={owner.avatar || '/static/images/no-avatar.png'} width='40' height='40' alt={owner.fullname} />
        <span className='full-name'>{owner.fullname}</span>
      </a>
    </div>)
  })
  return (
    <div className='panel-user'>
      {items}
    </div>
  )
}

function urlTopic (id, topics, onSelectTopic) {
  // TODO: click on name to filter by topic
  const currentTopics = topics.filter(item => item.urlIds.indexOf(id) !== -1)
  const items = []
  _.forEach(currentTopics, (topic) => {
    items.push(
      <a key={guid()} onClick={() => { onSelectTopic(topic) }}>
        <span className={`tags tags-color-${(topics.indexOf(topic) % MAX_COLORS) + 1}`} rel='tag'>
          <span className='text-tag'>{topic.name}</span>
        </span>
      </a>)
  })
  return (
    <div className='mix-tag'>
      {items}
    </div>
  )
}

function filterUrls (urls, filterByTopic, filterByUser, rating) {
  logger.warn('urls', urls)
  if (filterByTopic.length > 0 || filterByUser.length > 0) {
    const topicUrlIds = _.flatMap(filterByTopic, item => item.value)
    const userUrlIds = _.flatMap(filterByUser, item => item.value)
    let foundIds = []
    if (topicUrlIds.length && userUrlIds.length) {
      foundIds = _.intersection(topicUrlIds, userUrlIds)
    } else {
      if (topicUrlIds.length) {
        foundIds = topicUrlIds
      } else {
        foundIds = userUrlIds
      }
    }
    logger.warn('foundIds', foundIds)
    const result = urls.filter(item => foundIds.indexOf(item.id) !== -1 && item.rate >= rating)
    logger.warn('result', result)
    return _.uniqBy(result, 'title')
  }
  return _.uniqBy(urls.filter(item => item.rate >= rating), 'title')
}

@inject('store')
@inject('ui')
@observer
class FriendStreams extends React.PureComponent {
  render () {
    let urls = []
    let users = []
    let topics = []
    const friends = toJS(this.props.store.friendsStream)
    _.forEach(friends, friend => {
      const { user_id, fullname, avatar, list } = friend
      const urlIds = []
      const userUrls = []
      _.forEach(list, item => {
        userUrls.push(...item.urls)
        urlIds.push(...item.urls.map(item => item.id))
        if (item.topic_name) {
          topics.push({ name: item.topic_name, urlIds: item.urls.map(item => item.id) })
        }
      })
      const maxScore = _.maxBy(userUrls, 'im_score')
      urls.push(...userUrls.map(item => ({ ...item, rate: maxScore.im_score > 0 ? Math.floor(item.im_score * 5 / maxScore.im_score) : 0 })))
      users.push({ user_id, fullname, avatar, urlIds })
    })
    topics = _.uniqBy(topics, (item) => `${item.name}-${item.urlIds.length}`)
    let hasMoreItems = false
    const items = []
    // TODO: support sort by time or score
    const { filterByTopic, filterByUser, rating } = this.props.ui.friendStream
    const sortedUrls = filterUrls(urls, filterByTopic, filterByUser, rating)
    const sortedUrlsByHitUTC = _.reverse(_.sortBy(sortedUrls, [(url) => url.hit_utc]))
    /* eslint-disable camelcase */
    const currentUrls = sortedUrlsByHitUTC.slice(0, (this.props.ui.friendStream.page + 1) * LIMIT)
    logger.warn('currentUrls', currentUrls, this.props.ui.friendStream.page)
    if (currentUrls && currentUrls.length) {
      _.forEach(currentUrls, (item) => {
        const { id, href, img, title, time_on_tab, hit_utc, rate } = item
        let discoveryKeys = []
        if (item && item.suggestions_for_url && item.suggestions_for_url.length) {
          discoveryKeys = _.map(item.suggestions_for_url, 'term_name')
        }
        items.push(<div key={id} className='grid-item shuffle-item'>
          <div className='thumbnail-box'>
            <div className='thumbnail'>
              <div className='thumbnail-image'>
                <a href={href} target='_blank'>
                  <img src={img || '/static/images/no-image.png'} alt={title} />
                </a>
                {discoveryKeys && discoveryKeys.length > 0 && <DiscoveryButton keys={discoveryKeys.join(',')} />}
              </div>
              <div className='caption'>
                <h4 className='caption-title'>
                  <a href={href} target='_blank'>
                    {title} ({id})
                  </a>
                </h4>
                <p>
                  <i className='fa fa-bolt' /> Earned: <span className='nlp_score'>{href.length} XP</span>
                </p>
                <p className='para-date'>
                  <span className='date-time'>
                    <i className='fa fa-clock-o' /> Time on page: {moment.duration(time_on_tab).humanize()}
                  </span>
                </p>
                <p className='para-date'>
                  <span className='date-time'>
                    <i className='fa fa-calendar-o' /> Last visited: {moment.utc(hit_utc).fromNow()}
                  </span>
                </p>
                <div className='rating'>
                  <ReactStars edit={false} size={22} count={5} value={rate} />
                </div>
                {urlOwner(id, users, this.onSelectUser)}
                {urlTopic(id, topics, this.onSelectTopic)}
              </div>
            </div>
          </div>
        </div>)
      })
    }

    hasMoreItems = this.props.ui.myStream.page * LIMIT < sortedUrlsByHitUTC.length
    logger.warn('hasMoreItems', hasMoreItems)
    const streamList = []
    _.forEach(topics, (topic) =>
      streamList.push(<a key={guid()} onClick={() => this.props.ui.selectTopic(topic)} className='stream-item'>
        <span>
          {topic.name} ({topic.urlIds.length} urls)
        </span>
      </a>))

    const friendList = []
    _.forEach(friends, (user) =>
      friendList.push(<div key={guid()} className='user-item'>
        <a onClick={() => { this.props.ui.selectUser(user) }}>
          <span className='user-share'>
            <span className='user-share-img'>
              <img width='24' height='24' src={user.avatar || '/static/images/no-image.png'} alt={user.fullname} />
            </span>
            <span className='user-share-cnt'>
              <span className='user-share-inner'>
                <span className='user-info'><span className='share-fullname'>{user.fullname}</span> ({user.list.length} invitations)</span>
              </span>
            </span>
          </span>
        </a>
      </div>))
    return (
      <div className='react-tabs react-tabs'>
        <div className='react-tabs__tab-panel react-tabs__tab-panel--selected' role='tab-panel' id='react-tabs-1'>
          <div className='fragment-within'>
            <h1 className='heading-stream'>Friend Streams</h1>
            {friendList.length > 0 &&
            <p>You have unlocked {topics.length} topics from {friendList.length} friends:</p>
            }
          </div>
          {friendList.length > 0 &&
            <div className='friend-list'>
              <div className='user-list'>
                {friendList}
              </div>
            </div>
          }
          <div className='stream-list'>
            {streamList}
          </div>
          <div className='standand-sort'>
            <nav className='navbar'>
              <ul className='nav navbar-nav' >
                <FilterSearch
                  urls={urls}
                  topics={topics}
                  users={users}
                  rating={rating}
                  filterByTopic={filterByTopic.slice()}
                  filterByUser={filterByUser.slice()}
                  onChangeRate={this.props.ui.changeRate}
                  onSelectTopic={this.props.ui.selectTopic}
                  onRemoveTopic={this.props.ui.removeTopic}
                  onSelectUser={this.props.ui.selectUser}
                  onRemoveUser={this.props.ui.removeUser}
                />
              </ul>
            </nav>
          </div>
          <InfiniteScroll
            pageStart={this.props.ui.friendStream.page}
            loadMore={() => { this.props.ui.friendStream.page += 1 }}
            hasMore={false}
            loader={<Loading isLoading />}
            threshold={600}
          >
            <div className='main-inner'>
              <Masonry className='container-masonry' options={masonryOptions}>
                <div className='grid-row'>
                  {items}
                </div>
              </Masonry>
            </div>
          </InfiniteScroll>
        </div>
      </div>
    )
  }
}

export default FriendStreams
