/**
*
* Streams
*
*/

import React from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import ReactResizeDetector from 'react-resize-detector'
import Sticky from 'react-sticky-el'
import InfiniteScroll from 'react-infinite-scroller'
import moment from 'moment'
import _ from 'lodash'
import StreamItem from './StreamItem'
import InlinePreview from './InlinePreview'
import SplitView from '../../components/SplitView'
import GridView from '../../components/GridView'
import Loading from '../../components/Loading'
import FilterSearch from '../../components/FilterSearch'
import logger from '../../utils/logger'
import { tagColor } from '../../utils/helper'

const LIMIT = 10

function urlOwner (owners, users, onSelectUser) {
  const items = []
  _.forEach(owners, user => {
    const { hit_utc: hitUtc, owner: userId } = user
    const owner = users.find(item => item.user_id === userId)
    items.push(
      <div key={`${owner.fullname}-${hitUtc}`} className='panel-user-img'>
        <a onClick={() => { onSelectUser(owner) }} className='credit-user' title={`${owner.fullname} visited ${moment.utc(hitUtc).fromNow()}`}>
          <img onError={(ev) => { ev.target.src = '/static/images/no-image.png' }} src={owner.avatar || '/static/images/no-avatar.png'} width='40' height='40' alt={owner.fullname} />
        </a>
      </div>)
  })
  return (
    <div className='panel-user'>
      {items}
    </div>
  )
}

function urlTopic (urlId, topics, onSelectTopic, myUrlIds, onShareTopic) {
  const currentTopics = topics.filter(item => item.urlIds && item.urlIds.indexOf(urlId) !== -1)
  const items = []
  const isOwner = myUrlIds.indexOf(urlId) !== -1
  const maxLevel = _.maxBy(currentTopics, 'level')
  _.forEach(currentTopics.filter(item => item.level === maxLevel.level), (topic) => {
    items.push(
      <div className='mix-tag-topic' key={`${urlId}-${topic.name}`}>
        <span className={`tags ${tagColor(topic.name)}`} rel='tag'>
          <span onClick={() => { onSelectTopic(topic) }} className='text-tag'>{topic.name}</span>
          {
            isOwner &&
            <span onClick={() => { onShareTopic(topic) }} className='share-topic-ex'>
              <img src='/static/images/logo.png' width='25' height='25' alt='share firstLevelTopics' />
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

function filterbyRating (item, owners, userIds, rating) {
  const users = owners.filter(user => user.url_id === item.url_id)
  if (userIds.length) {
    return !!users.find(user => userIds.indexOf(user.owner) !== -1 && user.rate >= rating)
  }
  return !!users.find(user => user.rate >= rating)
}

function orderBy (result, owners, sortBy, sortDirection) {
  if (sortBy === 'date') {
    const sortResult = _.sortBy(result, (url) => {
      const users = owners.filter(item => item.url_id === url.url_id)
      return _.max(users.map(item => item.hit_utc))
    })
    return sortDirection === 'desc' ? _.reverse(sortResult) : sortResult
  } else {
    const sortResult = _.sortBy(result, (url) => {
      const users = owners.filter(item => item.url_id === url.url_id)
      return _.max(users.map(item => item.rate))
    })
    return sortDirection === 'desc' ? _.reverse(sortResult) : sortResult
  }
}

function filterUrls (urls, owners, filterByTopic, filterByUser, rating, sortBy, sortDirection) {
  const firstLevelTopics = toJS(filterByTopic)
  const users = toJS(filterByUser)
  if (firstLevelTopics.length > 0 || users.length > 0) {
    const topicUrlIds = _.flatMap(firstLevelTopics, item => item.value)
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
    const result = urls.filter(item => foundIds.indexOf(item.url_id) !== -1 && filterbyRating(item, owners, userIds, rating))
    return orderBy(result, owners, sortBy, sortDirection)
  }
  const result = urls.filter(item => filterbyRating(item, owners, [], rating))
  return orderBy(result, owners, sortBy, sortDirection)
}

function parseDomain (link) {
  /* global URL */
  const url = new URL(link)
  return url.hostname
}

@inject('store')
@inject('ui')
@observer
class Streams extends React.Component {
  state = {
    currentUrl: '',
    currentWidth: window.innerWidth / 2
  }

  hasMoreItem = () => {
    return this.props.ui.page * LIMIT < this.sortedUrls.length
  }

  loadMore = () => {
    logger.warn('loadMore')
    this.props.ui.page += 1
  }

  onPreview = (url) => {
    logger.warn('onPreview', url)
    this.setState({ currentUrl: url })
  }

  closePreview = () => {
    logger.warn('closePreview')
    this.setState({ currentUrl: '' })
  }

  onResizeStop = (width) => {
    this.setState({ currentWidth: width })
  }

  onLayout = () => {
    this.setState({ currentWidth: window.innerWidth / 2 })
  }

  render () {
    // populate urls and users
    const { urls, users, topics, owners } = toJS(this.props.store)
    const { urls: myUrls } = toJS(this.props.store.myStream)
    logger.warn('Streams render', urls, users, topics, owners, myUrls)
    const items = []
    // TODO: support sort by time or score
    const { filterByTopic, filterByUser, rating, sortBy, sortDirection } = this.props.ui
    this.sortedUrls = filterUrls(urls, owners, filterByTopic, filterByUser, rating, sortBy, sortDirection)
    /* eslint-disable camelcase */
    const currentUrls = this.sortedUrls.slice(0, (this.props.ui.page + 1) * LIMIT)
    const myUrlIds = myUrls.map(item => item.url_id)
    logger.warn('currentUrls', currentUrls)
    const { currentUrl, currentWidth } = this.state
    if (currentUrls && currentUrls.length) {
      _.forEach(currentUrls, (item) => {
        const { url_id, href, img, title } = item
        if (currentUrl !== href) {
          let discoveryKeys = []
          const suggestionKeys = []
          const currentTopics = topics.filter(item => item.urlIds && item.urlIds.indexOf(url_id) !== -1)
          const maxLevel = _.maxBy(currentTopics, 'level')
          const deepestTopics = currentTopics.filter(item => item.level === maxLevel.level)
          discoveryKeys = discoveryKeys.concat(_.map(deepestTopics, 'name'))
          if (deepestTopics.length) {
            deepestTopics.forEach(item => {
              suggestionKeys.push(..._.map(item.suggestions.slice(0, 5), 'term_name'))
            })
          }
          items.push(<StreamItem
            key={href}
            href={href}
            img={img}
            title={title}
            url_id={url_id}
            topics={topics}
            users={users}
            deepestTopics={deepestTopics}
            discoveryKeys={discoveryKeys}
            suggestionKeys={suggestionKeys}
            owners={owners}
            myUrlIds={myUrlIds}
            urlTopic={urlTopic}
            urlOwner={urlOwner}
            parseDomain={parseDomain}
            onPreview={this.onPreview}
          />)
        }
      })
    }

    return (
      <div className='streams'>
        <ReactResizeDetector handleWidth handleHeight onResize={this.onLayout} />
        <div className='standand-sort'>
          <FilterSearch sortedUrls={this.sortedUrls} owners={owners} />
        </div>
        <div className={currentUrl ? 'sticky-view' : 'hidden-view'}>
          <Sticky>
            <SplitView onResizeStop={this.onResizeStop} currentWidth={currentWidth}>
              {(width, height) => (<InlinePreview
                width={currentWidth}
                height={height}
                url={currentUrl}
                closePreview={this.closePreview}
                />)}
            </SplitView>
          </Sticky>
        </div>
        <div className={currentUrl ? 'split-view' : ''} style={{ width: currentUrl ? (window.innerWidth - currentWidth - 20) : '100%' }}>
          <InfiniteScroll
            pageStart={this.props.ui.page}
            loadMore={this.loadMore}
            hasMore={this.hasMoreItem()}
            loader={<Loading isLoading />}
             >
            <GridView>
              {items}
            </GridView>
          </InfiniteScroll>
        </div>
      </div>
    )
  }
}

export default Streams
