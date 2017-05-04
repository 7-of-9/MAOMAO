/**
*
* FriendStreams
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import Masonry from 'react-masonry-component'
import InfiniteScroll from 'react-infinite-scroller'
import ReactStars from 'react-stars'
import moment from 'moment'
import _ from 'lodash'
import logger from '../../utils/logger'
import Loading from '../../components/Loading'
import DiscoveryButton from '../../components/DiscoveryButton'
import { guid } from '../../utils/hash'

const LIMIT = 20
const masonryOptions = {
  itemSelector: '.grid-item',
  transitionDuration: '0.6s'
}

function mapTopicsOption (topics) {
  return _.map(topics, topic => ({
    value: topic.urlIds,
    label: `${topic.name}`
  }))
}

function mapUsersOption (users) {
  return _.map(users, item => ({
    value: item.urlIds,
    label: `${item.fullname}`
  }))
}

function urlOwner (id, users) {
  // TODO: click on name to filter by user
  const owners = users.filter(item => item.urlIds.indexOf(id) !== -1)
  const items = []
  _.forEach(owners, owner => {
    items.push(<div key={guid()} className='panel-user-img'>
      <a className='tooltip-user' title={owner.fullname}>
        <img src={owner.picture || '/static/images/no-avatar.png'} width='40' height='40' alt={owner.fullname} />
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

function urlTopic (id, topics) {
    // TODO: click on name to filter by topic
  const currentTopics = topics.filter(item => item.urlIds.indexOf(id) !== -1)
  const items = []
  _.forEach(currentTopics, topic => {
    items.push(<span key={guid()} className='tags tags-green' rel='tag'>{topic.name}</span>)
  })
  return (
    <div className='mix-tag'>
      {items}
    </div>
  )
}

function filterUrls (data) {
  const { urls, filterByTopic, filterByUser, filterByRating } = data
  logger.warn('filter', filterByRating, filterByTopic, filterByUser)
  const maxScore = _.maxBy(urls, 'im_score')
  let imScore = 0
  if (maxScore && maxScore.im_score) {
    logger.warn('maxScore', maxScore.im_score)
    imScore = parseInt(maxScore.im_score * filterByRating / 5)
  }
  logger.warn('imScore', imScore)
  if (filterByTopic.length > 0 || filterByUser.length > 0) {
    const topicUrlIds = _.flatMap(filterByTopic, item => item.value)
    const userUrlIds = _.flatMap(filterByUser, item => item.value)
    logger.warn('topicUrlIds', topicUrlIds)
    logger.warn('userUrlIds', userUrlIds)
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

    return _.uniqBy(urls.filter(item => foundIds.indexOf(item.id) !== -1 && item.im_score >= imScore), 'title')
  }
  return _.uniqBy(urls.filter(item => item.im_score >= imScore), 'title')
}

class FriendStreams extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      hasMoreItems: false,
      currentPage: 1,
      urls: [],
      users: [],
      topics: [],
      filterByTopic: '',
      filterByUser: '',
      filterByRating: 0
    }
    this.loadMore = this.loadMore.bind(this)
  }

  componentDidMount () {
    const { friends } = this.props
    let urls = []
    let users = []
    let topics = []
    _.forEach(friends, friend => {
      const { user_id, fullname, avatar, list } = friend
      const urlIds = []
      _.forEach(list, item => {
        urls.push(...item.urls)
        urlIds.push(...item.urls.map(item => item.id))
        if (item.topic_name) {
          topics.push({ name: item.topic_name, urlIds: item.urls.map(item => item.id) })
        }
      })
      users.push({ user_id, fullname, avatar, urlIds })
    })
    topics = _.uniqBy(topics, (item) => `${item.name}-${item.urlIds.length}`)
    const hasMoreItems = this.state.currentPage * LIMIT <= urls.length
    this.setState({
      urls,
      users,
      topics,
      hasMoreItems
    })
  }

  componentWillUpdate (props) {
    logger.warn('componentWillUpdate', props)
    const { friends } = props
    const { users } = this.state
    if (friends.length !== users.length) {
      let urls = []
      let users = []
      let topics = []
      _.forEach(friends, friend => {
        const { user_id, fullname, avatar, list } = friend
        const urlIds = []
        _.forEach(list, item => {
          urls.push(...item.urls)
          urlIds.push(...item.urls.map(item => item.id))
          if (item.topic_name) {
            topics.push({ name: item.topic_name, urlIds: item.urls.map(item => item.id) })
          }
        })
        users.push({ user_id, fullname, avatar, urlIds })
      })
      topics = _.uniqBy(topics, (item) => `${item.name}-${item.urlIds.length}`)
      const hasMoreItems = this.state.currentPage * LIMIT <= urls.length
      this.setState({
        urls,
        users,
        topics,
        hasMoreItems
      })
    }
  }

  loadMore () {
    const currentPage = this.state.currentPage + 1
    const sortedUrls = filterUrls(this.state)
    const hasMoreItems = currentPage * LIMIT <= sortedUrls.length
    this.setState({
      hasMoreItems,
      currentPage
    })
  }

  render () {
    const { currentPage } = this.state
    const items = []
      // TODO: support sort by time or score
    const sortedUrls = filterUrls(this.state)
    const maxScore = _.maxBy(sortedUrls, 'im_score')
    const sortedUrlsByHitUTC = _.reverse(_.sortBy(sortedUrls, [(url) => url.hit_utc]))
      /* eslint-disable camelcase */
    const currentUrls = sortedUrlsByHitUTC.slice(0, currentPage * LIMIT)
    logger.warn('currentUrls', currentUrls, currentPage)
    if (currentUrls && currentUrls.length) {
      _.forEach(currentUrls, (item) => {
        const { id, href, img, title, im_score, time_on_tab, hit_utc } = item
        const rate = Math.floor(im_score * 5 / maxScore.im_score)
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
                {urlTopic(id, this.state.topics)}
                {discoveryKeys && discoveryKeys.length > 0 && <DiscoveryButton keys={discoveryKeys.join(',')} /> }
              </div>
              <div className='caption'>
                <h4 className='caption-title'>
                  <a href={href} target='_blank'>{title} ({id})</a>
                </h4>
                <p> Earned XP <span className='nlp_score'>{href.length}</span> ({moment.duration(time_on_tab).humanize()})</p>
                <div className='rating'>
                  <ReactStars edit={false} size={22} count={5} value={rate} />
                </div>
                <p className='para-date'><span className='date-time'><i className='fa fa-calendar-o' />
                  &nbsp;{moment.utc(hit_utc).fromNow()}
                </span></p>
                {urlOwner(id, this.state.users)}
              </div>
            </div>
          </div>
        </div>)
      })
    }
    return (
      <div className='ReactTabs react-tabs'>
        <div className='ReactTabs__TabPanel ReactTabs__TabPanel--selected' role='tabpanel' id='react-tabs-1'>
          <div className='standand-sort'>
            <nav className='navbar'>
              <ul className='nav navbar-nav'>
                <li>
                  <div className='item-select'>
                    <span className='label-select'>Topics</span>
                    <Select
                      className='drop-select'
                      name='topic-name'
                      multi
                      value={this.state.filterByTopic}
                      options={mapTopicsOption(this.state.topics)}
                      onChange={(selectValue) => this.setState({filterByTopic: selectValue, currentPage: 1, hasMoreItems: true})}
                      />
                  </div>
                </li>
                <li>
                  <div className='item-select'>
                    <span className='label-select'>Users</span>
                    <Select
                      className='drop-select'
                      multi
                      name='user-name'
                      value={this.state.filterByUser}
                      options={mapUsersOption(this.state.users)}
                      onChange={(selectValue) => this.setState({filterByUser: selectValue, currentPage: 1, hasMoreItems: true})}
                      />
                  </div>
                </li>
                <li>
                  <div className='item-select'>
                    <span className='label-select'>Rating</span>
                    <div className='filter-rating'>
                      <ReactStars
                        count={5}
                        value={this.state.filterByRating}
                        onChange={(selectValue) => this.setState({filterByRating: selectValue, currentPage: 1, hasMoreItems: true})}
                        size={24}
                        half={false}
                        color2={'#ffd700'}
                      />
                    </div>
                  </div>
                </li>
                <li>
                  <div className='input-group'>
                    <input type='text' className='form-control' placeholder='Search URL ...' />
                  </div>
                </li>
              </ul>
            </nav>
          </div>
          <InfiniteScroll
            pageStart={0}
            loadMore={this.loadMore}
            hasMore={this.state.hasMoreItems}
            loader={<Loading isLoading />}
            threshold={600}
          >
            <Masonry className='container-masonry' options={masonryOptions}>
              <div className='grid-row'>
                {items}
              </div>
            </Masonry>
          </InfiniteScroll>
        </div>
      </div>
    )
  }
}

FriendStreams.propTypes = {
  friends: PropTypes.array.isRequired
}

export default FriendStreams
