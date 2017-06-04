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
import { guid } from '../../utils/hash'
// import logger from '../../utils/logger'

const LIMIT = 10
const MAX_COLORS = 12
const masonryOptions = {
  itemSelector: '.grid-item',
  transitionDuration: '0.4s'
}

const avatar = (user) => {
  if (user && (user.picture || user.avatar)) {
    return user.picture || user.avatar
  }
  return '/static/images/no-avatar.png'
}

function urlOwner (id, timeOnTab, hitUtc, users, onSelectUser) {
  // TODO: click on name to filter by user
  const owners = users.filter(item => item.urlIds.indexOf(id) !== -1)
  const items = []
  _.forEach(owners, owner => {
    items.push(<div key={guid()} className='panel-user-img'>
      <a onClick={() => { onSelectUser(owner) }} className='credit-user' title={owner.fullname}>
        <img src={owner.avatar || '/static/images/no-avatar.png'} width='40' height='40' alt={owner.fullname} />
        <span className='panel-user-cnt'>
          <span className='full-name'>{owner.fullname}</span>
          <span className='date-time'>
            <i className='fa fa-clock-o' /> Time on page: {moment.duration(timeOnTab).humanize()}
          </span>
          <span className='date-time'>
            <i className='fa fa-calendar-o' /> Last visited: {moment.utc(hitUtc).fromNow()}
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

function urlTopic (id, topics, onSelectTopic, onShareTopic) {
  // TODO: click on name to filter by topic
  const currentTopics = topics.filter(item => item.urlIds.indexOf(id) !== -1)
  const items = []
  _.forEach(currentTopics, (topic) => {
    items.push(
      <div className='mix-tag-topic' key={guid()}>
        <span className={`tags tags-color-${(topics.indexOf(topic) % MAX_COLORS) + 1}`} rel='tag'>
          <span onClick={() => { onSelectTopic(topic) }} className='text-tag'>{topic.name}</span>
          <span onClick={() => { onShareTopic(topic) }} className='share-topic-ex'>
            <img src='/static/images/logo.png' width='25' height='25' alt='share topics' />
          </span>
        </span>
      </div>)
  })
  return (
    <div className='mix-tag'>
      {items}
    </div>
  )
}

function filterUrls (urls, filterByTopic, filterByUser, rating) {
  const topics = toJS(filterByTopic)
  const users = toJS(filterByUser)
  if (topics.length > 0 || users.length > 0) {
    const topicUrlIds = _.flatMap(topics, item => item.value)
    const userUrlIds = _.flatMap(users, item => item.value)
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
    const result = urls.filter(item => foundIds.indexOf(item.id) !== -1 && item.rate >= rating)
    return _.uniqBy(result, 'title')
  }
  return _.uniqBy(urls.filter(item => item.rate >= rating), 'title')
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
  render () {
    // populate urls and users
    const { urls, users, topics, userId } = toJS(this.props.store)
    let hasMoreItems = false
    const items = []
    // TODO: support sort by time or score
    const { filterByTopic, filterByUser, rating, sortByDate } = this.props.ui
    const sortedUrls = filterUrls(urls, filterByTopic, filterByUser, rating)
    const sortedUrlsByHitUTC = sortByDate === 'desc' ? _.reverse(_.sortBy(sortedUrls, [(url) => url.hit_utc])) : _.sortBy(sortedUrls, [(url) => url.hit_utc])
    /* eslint-disable camelcase */
    const currentUrls = sortedUrlsByHitUTC.slice(0, (this.props.ui.page + 1) * LIMIT)
    if (currentUrls && currentUrls.length) {
      _.forEach(currentUrls, (item) => {
        const { id, href, img, title, time_on_tab, hit_utc, rate } = item
        let discoveryKeys = []
        const currentTopics = topics.filter(item => item.urlIds.indexOf(id) !== -1)
        discoveryKeys = discoveryKeys.concat(_.map(currentTopics, 'name'))
        if (item && item.suggestions_for_url && item.suggestions_for_url.length) {
          discoveryKeys = _.map(item.suggestions_for_url, 'term_name')
        }
        items.push(<div key={id} className='grid-item shuffle-item'>
          <div className='thumbnail-box'>
            {discoveryKeys && discoveryKeys.length > 0 && <DiscoveryButton openDiscoveryMode={() => this.props.ui.openDiscoveryMode(discoveryKeys)} />}
            <div className='thumbnail'>
              <a href={href} target='_blank'>
                <div className='thumbnail-image'>
                  <img src={img || '/static/images/no-image.png'} alt={title} />
                </div>
              </a>
              <div className='caption'>
                <h4 className='caption-title'>
                  <a href={href} target='_blank'>
                    {title} ({id})
                  </a>
                </h4>
                <div className='filter-box'>
                  <div className='filter-rating'>
                    <span className={rate >= 1 ? 'active' : ''} />
                    <span className={rate >= 2 ? 'active' : ''} />
                    <span className={rate >= 3 ? 'active' : ''} />
                    <span className={rate >= 4 ? 'active' : ''} />
                    <span className={rate >= 5 ? 'active' : ''} />
                  </div>
                  <div className='parameter-item'>
                    <h5 className='caption-title'>{parseDomain(href)}</h5>
                    <p>
                      <i className='fa fa-bolt' /> Earned: <span className='nlp_score'>{href.length} XP</span>
                    </p>
                  </div>
                </div>
                {urlOwner(id, time_on_tab, hit_utc, users, (user) => this.props.ui.selectUser(user))}
                {urlTopic(id, topics, (topic) => this.props.ui.selectTopic(topic), (topic) => {})}
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
                  <nav className='navbar'>
                    <div className='nav navbar-nav' >
                      <div className='switch-responsive'>
                        <div className='switch-item'>
                          <div className='checkbox__styled'>
                            <input onChange={() => this.props.ui.toggleOnlyMe()} type='checkbox' className='checkbox__styled__input' id='checkbox-mobile-only-me' name='only-me-mobile' value={userId} checked={this.props.ui.onlyMe} />
                            <label className='checkbox__styled__label' htmlFor='checkbox-mobile-only-me'>Only me</label>
                          </div>
                        </div>
                        <div className='switch-item'>
                          <button className='btn btn-search navbar-toggler' type='button' data-toggle='collapse' data-target='#toolbar-search' aria-expanded='true'>
                            <i className='fa fa-search' />
                          </button>
                        </div>
                        <div className='switch-item'>
                          <button className='btn btn-navicon navbar-toggler collapsed' type='button' data-toggle='collapse' data-target='#toolbar-sort' aria-expanded='false'>
                            <i className='fa fa-gear' />
                          </button>
                        </div>
                      </div>
                      <div id='toolbar-search' className='widget-form collapse' aria-expanded='true'>
                        <div className='checkbox__styled'>
                          <input onChange={() => this.props.ui.toggleOnlyMe(userId, users)} type='checkbox' className='checkbox__styled__input' id='checkbox-only-me' name='only-me' value={userId} checked={this.props.ui.onlyMe} />
                          <label className='checkbox__styled__label' htmlFor='checkbox-only-me'>Only me</label>
                        </div>
                        <FilterSearch
                          urls={urls}
                          topics={topics}
                          users={users}
                          rating={rating}
                          filterByTopic={toJS(filterByTopic)}
                          filterByUser={toJS(filterByUser)}
                          onChangeRate={(rate) => this.props.ui.changeRate(rate)}
                          onSelectTopic={(topic) => this.props.ui.selectTopic(topic)}
                          onRemoveTopic={(topic) => this.props.ui.removeTopic(topic)}
                          onSelectUser={(user) => this.props.ui.selectUser(user)}
                          onRemoveUser={(user) => this.props.ui.removeUser(user)}
                        />
                      </div>
                      <div id='toolbar-sort' className='widget-row collapse' aria-expanded='false'>
                        <div className='widget-dropdown'>
                          <div className='widget-topic'>
                            <a data-toggle='dropdown'>
                              <span className='nav-symbol'><i className='fa fa-list fa-2x' aria-hidden='true' /></span>
                              <span className='nav-text'>List Streams</span>
                            </a>
                            <ul className='dropdown-menu'>
                              {topics.map(topic => (
                                <li key={guid()} onClick={() => this.props.ui.selectTopic(topic)}><span className='topic-name'><i className='fa fa-angle-right' aria-hidden='true' /> {topic.name}</span></li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className='widget-dropdown'>
                          <div className='widget-user'>
                            <a data-toggle='dropdown'>
                              <span className='nav-symbol'><i className='fa fa-users fa-2x' aria-hidden='true' /></span>
                              <span className='nav-text'>List Users</span>
                            </a>
                            <ul className='dropdown-menu'>
                              {users.map(user =>
                                (<li onClick={() => this.props.ui.selectUser(user)} key={guid()}>
                                  <div className='user-share'>
                                    <div className='user-share-img'>
                                      <img width='24' height='24' src={avatar(user)} alt={user.fullname} />
                                    </div>
                                    <div className='user-share-cnt'>
                                      <div className='user-share-inner'>
                                        <p className='user-info'>
                                          <span className='share-fullname'>{user.fullname}</span>
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                                ))}
                            </ul>
                          </div>
                        </div>
                        <div className='widget-dropdown'>
                          <div className='widget-calendar active'>
                            <span className='nav-symbol'><i className='fa fa-calendar fa-2x' aria-hidden='true' /></span>
                            <span className='nav-text'>Order by date</span>
                            <span className='order-calendar'>
                              <a
                                className={this.props.ui.sortByDate === 'asc' ? 'order-asc active' : 'order-asc'}
                                onClick={() => this.props.ui.changeSortOrder('asc')}
                                ><i className='fa fa-sort-up' aria-hidden='true' />
                              </a>
                              <a
                                className={this.props.ui.sortByDate !== 'asc' ? 'order-desc active' : 'order-desc'}
                                onClick={() => this.props.ui.changeSortOrder('desc')}
                                >
                                <i className='fa fa-sort-desc' aria-hidden='true' />
                              </a>
                            </span>
                          </div>
                        </div>
                        <div className='sort-case'>
                          {
                            [1, 2, 3, 4, 5].map((rate) => (
                              <div className={rate >= rating ? 'sort-case-item active' : 'sort-case-item'} key={guid()}>
                                <a onClick={() => this.props.ui.changeRate(rate)} className='filter-rating'>
                                  {
                                    [1, 2, 3, 4, 5].map((star) => (
                                      <span className={star <= rate ? 'active' : ''} key={guid()} />
                                   ))
                                  }
                                </a>
                                <div className='rating-number'>
                                  <div className='label-rating-number'>{rate}</div>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  </nav>
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
      </StickyContainer>
    )
  }
}

export default Streams
