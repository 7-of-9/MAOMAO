/**
*
* FriendStreams
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import latinize from 'latinize'
import Select from 'react-select'
import Masonry from 'react-masonry-component'
import InfiniteScroll from 'react-infinite-scroller'
import ReactStars from 'react-stars'
import DebounceInput from 'react-debounce-input'
import Highlighter from 'react-highlight-words'
import moment from 'moment'
import _ from 'lodash'
import logger from '../../utils/logger'
import Loading from '../../components/Loading'
import DiscoveryButton from '../../components/DiscoveryButton'
import { guid } from '../../utils/hash'

const LIMIT = 20
const masonryOptions = {
  itemSelector: '.grid-item',
  transitionDuration: '0.4s'
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
        <span className={`tags tags-color-${topics.indexOf(topic) + 1}`} rel='tag'>
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

function filterUrls (data) {
  const { urls, filterByTopic, filterByUser, filterByRating, filterByUrl } = data
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
    if (filterByUrl.length) {
      const result = urls.filter(item => foundIds.indexOf(item.id) !== -1 && item.rate >= filterByRating && item.title.toLowerCase().indexOf(filterByUrl) !== -1)
      logger.warn('result', result)
      return _.uniqBy(result, 'title')
    } else {
      const result = urls.filter(item => foundIds.indexOf(item.id) !== -1 && item.rate >= filterByRating)
      logger.warn('result', result)
      return _.uniqBy(result, 'title')
    }
  }
  if (filterByUrl.length) {
    return _.uniqBy(urls.filter(item => item.rate >= filterByRating && item.title.toLowerCase().indexOf(filterByUrl) !== -1), 'title')
  } else {
    return _.uniqBy(urls.filter(item => item.rate >= filterByRating), 'title')
  }
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
      filterByUrl: '',
      filterByRating: 3
    }
    this.loadMore = this.loadMore.bind(this)
    this.onSelectTopic = this.onSelectTopic.bind(this)
    this.onSelectUser = this.onSelectUser.bind(this)
  }

  componentDidMount () {
    const { friends } = this.props
    let urls = []
    let users = []
    let topics = []
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
    const hasMoreItems = this.state.currentPage * LIMIT <= urls.length
    this.setState({
      urls,
      users,
      topics,
      hasMoreItems
    })
  }

  componentWillUpdate (props) {
    const { friends } = props
    const { users } = this.state
    if (friends.length !== users.length) {
      let urls = []
      let users = []
      let topics = []
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
      const hasMoreItems = this.state.currentPage * LIMIT <= urls.length
      this.setState({
        urls,
        users,
        topics,
        hasMoreItems
      })
    }
  }

  onSelectTopic (topic) {
    logger.warn('onSelectTopic', topic)
    this.setState({ filterByTopic: [{ value: topic.urlIds, label: topic.name }], currentPage: 1, hasMoreItems: true })
  }

  onSelectUser (user) {
    logger.warn('onSelectUser', user)
    this.setState({ filterByUser: [{ value: user.urlIds, label: user.fullname }], currentPage: 1, hasMoreItems: true })
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
    const sortedUrlsByHitUTC = _.reverse(_.sortBy(sortedUrls, [(url) => url.hit_utc]))
    /* eslint-disable camelcase */
    const currentUrls = sortedUrlsByHitUTC.slice(0, currentPage * LIMIT)
    logger.warn('currentUrls', currentUrls, currentPage)
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
                {urlTopic(id, this.state.topics, this.onSelectTopic)}
                {discoveryKeys && discoveryKeys.length > 0 && <DiscoveryButton keys={discoveryKeys.join(',')} />}
              </div>
              <div className='caption'>
                <h4 className='caption-title'>
                  <a href={href} target='_blank'>
                    <Highlighter
                      activeIndex={title}
                      highlightStyle={{ backgroundColor: '#ffd54f' }}
                      sanitize={latinize}
                      searchWords={[this.state.filterByUrl]}
                      textToHighlight={title}
                    />
                    ({id})</a>
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
                {urlOwner(id, this.state.users, this.onSelectUser)}
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
                {this.state.filterByTopic.length > 0 &&
                  <li>
                    <div className='item-select'>
                      <span className='label-select'>Streams</span>
                      <Select
                        className='drop-select'
                        name='topic-name'
                        multi
                        value={this.state.filterByTopic}
                        options={mapTopicsOption(this.state.topics)}
                        onChange={(selectValue) => this.setState({ filterByTopic: selectValue, currentPage: 1, hasMoreItems: true })}
                      />
                    </div>
                  </li>
                }
                {this.state.filterByUser.length > 0 &&
                  <li>
                    <div className='item-select'>
                      <span className='label-select'>Users</span>
                      <Select
                        className='drop-select'
                        multi
                        name='user-name'
                        value={this.state.filterByUser}
                        options={mapUsersOption(this.state.users)}
                        onChange={(selectValue) => this.setState({ filterByUser: selectValue, currentPage: 1, hasMoreItems: true })}
                      />
                    </div>
                  </li>
                }
                <li>
                  <div className='input-group'>
                    <DebounceInput
                      className='form-control'
                      placeholder='Search URL ...'
                      minLength={2}
                      debounceTimeout={300}
                      onChange={event => this.setState({ filterByUrl: event.target.value.toLowerCase() })} />
                    <div className='filter-rating'>
                      <ReactStars
                        count={5}
                        value={this.state.filterByRating}
                        onChange={(selectValue) => this.setState({ filterByRating: selectValue, currentPage: 1, hasMoreItems: true })}
                        size={24}
                        half={false}
                        color2={'#ffd700'}
                      />
                    </div>
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

FriendStreams.propTypes = {
  friends: PropTypes.array.isRequired
}

export default FriendStreams
