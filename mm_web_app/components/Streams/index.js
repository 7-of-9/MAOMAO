/**
*
* Streams
*
*/

import React from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import { StickyContainer, Sticky } from 'react-sticky'
import Masonry from 'react-masonry-component'
import InfiniteScroll from 'react-infinite-scroller'
import moment from 'moment'
import _ from 'lodash'
import Loading from '../../components/Loading'
import DiscoveryButton from '../../components/DiscoveryButton'
import FilterSearch from '../../components/FilterSearch'
import logger from '../../utils/logger'
import { guid } from '../../utils/hash'

const LIMIT = 10
const MAX_COLORS = 12
const masonryOptions = {
  itemSelector: '.grid-item',
  transitionDuration: '0.4s'
}

function urlOwner (id, owners, users, filterByUser, onSelectUser) {
  const items = []
  const userIds = _.flatMap(toJS(filterByUser), item => item.user_id)
  const ownersFilter = userIds.length > 0 ? owners.filter(item => userIds.indexOf(item.owner) !== -1) : owners
  _.forEach(ownersFilter, user => {
    const { hit_utc: hitUtc, time_on_tab: timeOnTab, owner: userId, im_score: IMScore, rate } = user
    const owner = users.find(item => item.user_id === userId)
    items.push(
      <div key={guid()} className='panel-user-img'>
        <a onClick={() => { onSelectUser(owner) }} className='credit-user' title={owner.fullname}>
          <img src={owner.avatar || '/static/images/no-avatar.png'} width='40' height='40' alt={owner.fullname} />
          <span className='panel-user-cnt'>
            <span className='full-name'>{owner.fullname} visited {moment.utc(hitUtc).fromNow()}</span>
            <div className='filter-rating'>
              <span className={rate >= 1 ? 'active' : ''} />
              <span className={rate >= 2 ? 'active' : ''} />
              <span className={rate >= 3 ? 'active' : ''} />
              <span className={rate >= 4 ? 'active' : ''} />
              <span className={rate >= 5 ? 'active' : ''} />
            </div>
            <span className='date-time'>
              <i className='fa fa-bolt' /> Earned: <span className='nlp_score'>{parseInt(IMScore)} XP</span>
            </span>
            <span className='date-time'>
              <i className='fa fa-angle-double-down' /> IM Score: <span className='nlp_score'>{parseInt(timeOnTab / 1000)}</span>
            </span>
            <span className='date-time'>
              <i className='fa fa-clock-o' /> Time on page: {moment.duration(timeOnTab).humanize()}
            </span>
          </span>
        </a>
      </div>)
  })
  return (
    <div className='panel-user'>
      {items}
    </div>
  )
}

function urlTopic (id, topics, onSelectTopic, myUrlIds, onShareTopic) {
  const currentTopics = topics.filter(item => item.urlIds.indexOf(id) !== -1)
  const items = []
  const isOwner = myUrlIds.indexOf(id) !== -1
  _.forEach(currentTopics, (topic) => {
    items.push(
      <div className='mix-tag-topic' key={guid()}>
        <span className={`tags tags-color-${(topics.indexOf(topic) % MAX_COLORS) + 1}`} rel='tag'>
          <span onClick={() => { onSelectTopic(topic) }} className='text-tag'>{topic.name}</span>
          {
            isOwner && topic.id &&
            <span onClick={() => { onShareTopic(topic) }} className='share-topic-ex'>
              <img src='/static/images/logo.png' width='25' height='25' alt='share topics' />
            </span>
          }
        </span>
      </div>)
  })
  return (
    <div className='mix-tag'>
      {items}
    </div>
  )
}

function findUserRating (item, userIds) {
  if (userIds.length) {
    const owner = item.owners.find(item => userIds.indexOf(item.owner) !== -1)
    return owner.rate
  }
  return item.owners[0].rate
}

function filterUrls (urls, filterByTopic, filterByUser, rating) {
  const topics = toJS(filterByTopic)
  const users = toJS(filterByUser)
  if (topics.length > 0 || users.length > 0) {
    const topicUrlIds = _.flatMap(topics, item => item.value)
    const userUrlIds = _.flatMap(users, item => item.value)
    const userIds = _.flatMap(users, item => item.user_id)
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
    const result = urls.filter(item => foundIds.indexOf(item.id) !== -1 && findUserRating(item, userIds) >= rating)
    return result
  }
  const result = urls.filter(item => item.owners[0].rate >= rating)
  return result
}

function sortByOrdering (sortedUrls, sortBy, sortDirection) {
  if (sortBy === 'date') {
    return sortDirection === 'desc' ? _.reverse(_.sortBy(sortedUrls, [(url) => _.max(url.owners[0].hit_utc)])) : _.sortBy(sortedUrls, [(url) => url.owners[0].hit_utc])
  } else {
    return sortDirection === 'desc' ? _.reverse(_.sortBy(sortedUrls, [(url) => url.owners[0].rate])) : _.sortBy(sortedUrls, [(url) => url.owners[0].rate])
  }
}

function parseDomain (link) {
  /* global URL */
  const url = new URL(link)
  return url.hostname
}

@inject('store')
@inject('ui')
@observer
class Streams extends React.PureComponent {
  componentDidMount () {
    logger.warn('Streams componentDidMount')
  }

  componentWillReact () {
    logger.warn('Streams componentWillReact')
  }
  render () {
    // populate urls and users
    logger.warn('Streams render')
    const { urls, users, topics } = toJS(this.props.store)
    const { urls: myUrls } = toJS(this.props.store.myStream)
    let hasMoreItems = false
    const items = []
    // TODO: support sort by time or score
    const { filterByTopic, filterByUser, rating, sortBy, sortDirection } = this.props.ui
    const sortedUrls = filterUrls(urls, filterByTopic, filterByUser, rating)
    let sortedUrlsByHitUTC = sortByOrdering(sortedUrls, sortBy, sortDirection)
    /* eslint-disable camelcase */
    const currentUrls = sortedUrlsByHitUTC.slice(0, (this.props.ui.page + 1) * LIMIT)
    const myUrlIds = myUrls.map(item => item.id)
    logger.warn('currentUrls', currentUrls)
    if (currentUrls && currentUrls.length) {
      _.forEach(currentUrls, (item) => {
        const { id, href, img, title, owners } = item
        let discoveryKeys = []
        let suggestionKeys = []
        const currentTopics = topics.filter(item => item.urlIds.indexOf(id) !== -1)
        discoveryKeys = discoveryKeys.concat(_.map(currentTopics, 'name'))
        if (item && item.suggestions && item.suggestions.length) {
          suggestionKeys = _.map(item.suggestions.slice(0, 5), 'term_name')
        }
        items.push(<div key={guid()} className='grid-item shuffle-item'>
          <div className='thumbnail-box'>
            {discoveryKeys && discoveryKeys.length > 0 && <DiscoveryButton openDiscoveryMode={() => this.props.ui.openDiscoveryMode(discoveryKeys, suggestionKeys)} />}
            <div className='thumbnail'>
              <div className='thumbnail-image'>
                <a className='thumbnail-overlay' href={href} target='_blank'>
                  <img src={img || '/static/images/no-image.png'} alt={title} />
                </a>
                {urlTopic(id, topics, (topic) => this.props.ui.selectTopic(topic), myUrlIds, (topic) => this.props.ui.openShareTopic(id, topic))}
              </div>
              <div className='caption'>
                <h4 className='caption-title'>
                  <a href={href} target='_blank'>
                    {title} ({id})
                  </a>
                </h4>
                <h5 className='caption-title'>{parseDomain(href)}</h5>
                {urlOwner(id, owners, users, filterByUser, (user) => this.props.ui.selectUser(user))}
              </div>
            </div>
          </div>
        </div>)
      })
    }

    hasMoreItems = this.props.ui.page * LIMIT < sortedUrlsByHitUTC.length
    return (
      <StickyContainer className='streams'>
        <Sticky>
          {
            ({ style }) => {
              return (
                <div style={{ ...style, margin: '0', zIndex: 1000, backgroundColor: '#fff' }} className='standand-sort'>
                  <FilterSearch sortedUrls={sortedUrls} />
                </div>
              )
            }
          }
        </Sticky>
        <InfiniteScroll
          pageStart={this.props.ui.page}
          loadMore={() => { this.props.ui.page += 1 }}
          hasMore={hasMoreItems}
          loader={<Loading isLoading />}
        >
          <div className='main-inner'>
            <Masonry className='container-masonry' options={masonryOptions}>
              <div className='grid-row'>
                {items}
              </div>
            </Masonry>
          </div>
        </InfiniteScroll>
      </StickyContainer>
    )
  }
}

export default Streams
