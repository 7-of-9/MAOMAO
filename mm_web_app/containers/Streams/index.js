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
class Streams extends React.PureComponent {
  render () {
    // populate urls and users
    const { urls, users, topics } = toJS(this.props.store)
    let hasMoreItems = false
    const items = []
    // TODO: support sort by time or score
    const { filterByTopic, filterByUser, rating } = this.props.ui
    const sortedUrls = filterUrls(urls, filterByTopic, filterByUser, rating)
    const sortedUrlsByHitUTC = _.reverse(_.sortBy(sortedUrls, [(url) => url.hit_utc]))
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
            {discoveryKeys && discoveryKeys.length > 0 && <DiscoveryButton keys={discoveryKeys.join(',')} />}
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
                {urlTopic(id, topics, (topic) => this.props.ui.selectTopic(topic))}
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
                      <div className='widget-dropdown'>
                        <div className='widget-topic'>
                          <a data-toggle='dropdown'>
                            <i className='fa fa-list fa-2x' aria-hidden='true' />
                            <span className='nav-text'>List Topic</span>
                          </a>
                          <ul className="dropdown-menu dropdown-modifier stream-list pull-right">
                            <li>
                              <span className="topic-name">
                                <i className="fa fa-angle-right" aria-hidden="true"></i> Arts
                              </span>
                            </li>
                            <li>
                              <span className="topic-name">
                                <i className="fa fa-angle-right" aria-hidden="true"></i> Economy
                              </span>
                            </li>
                            <li>
                              <span className="topic-name">
                                <i className="fa fa-angle-right" aria-hidden="true"></i> Family
                              </span>
                            </li>
                            <li>
                              <span className="topic-name">
                                <i className="fa fa-angle-right" aria-hidden="true"></i> Fashion
                              </span>
                            </li>
                            <li>
                              <span className="topic-name">
                                <i className="fa fa-angle-right" aria-hidden="true"></i> Food and drink
                              </span>
                            </li>
                            <li>
                              <span className="topic-name">
                                <i className="fa fa-angle-right" aria-hidden="true"></i> Games
                              </span>
                            </li>
                            <li>
                              <span className="topic-name">
                                <i className="fa fa-angle-right" aria-hidden="true"></i> History
                              </span>
                            </li>
                            <li>
                              <span className="topic-name">
                                <i className="fa fa-angle-right" aria-hidden="true"></i> Mathematics
                              </span>
                            </li>
                          </ul>
                        </div>
                        <div className='widget-user'>
                          <a data-toggle='dropdown'>
                            <i className='fa fa-users fa-2x' aria-hidden='true' />
                            <span className='nav-text'>Friend Streams</span>
                          </a>
                          <ul className="dropdown-menu dropdown-modifier  pull-right">
                            <li>
                              <div className="user-share">
                                <div className="user-share-img">
                                  <img width="24" height="24" src="https://scontent.xx.fbcdn.net/v/t1.0-1/s100x100/1098332_526239880830644_611792346_n.jpg?oh=a8613e2896f4ad275da640f36bc72ac1&amp;oe=599AC622" alt="Đại Quang Minh" />
                                </div>
                                <div className="user-share-cnt">
                                  <div className="user-share-inner">
                                    <p className="user-info"><span className="share-fullname">Đại Quang Minh</span></p>
                                  </div>
                                </div>
                              </div>
                            </li>
                            <li>
                              <div className="user-share">
                                <div className="user-share-img">
                                  <img width="24" height="24" src="https://scontent.xx.fbcdn.net/v/t1.0-1/s100x100/14702240_10207386391686714_2875182266540735639_n.jpg?oh=3fe0b8f61f0774ca75120127cd640154&amp;oe=5957A4E8" alt="Dominic Morris" />
                                </div>
                                <div className="user-share-cnt">
                                  <div className="user-share-inner">
                                    <p className="user-info"><span className="share-fullname">Dominic Morris</span></p>
                                  </div>
                                </div>
                              </div>
                            </li>
                            <li>
                              <div className="user-share">
                                <div className="user-share-img">
                                  <img width="24" height="24" src="/static/images/no-avatar.png" alt="Jack Son" />
                                </div>
                                <div className="user-share-cnt">
                                  <div className="user-share-inner">
                                    <p className="user-info"><span className="share-fullname">Jack Son</span></p>
                                  </div>
                                </div>
                              </div>
                            </li>
                            <li>
                              <div className="user-share">
                                <div className="user-share-img">
                                  <img width="24" height="24" src="https://lh6.googleusercontent.com/-WLGCOsPN58Q/AAAAAAAAAAI/AAAAAAAAABc/pJzt8KW6Pxg/photo.jpg" alt="Đức Dũng Huỳnh" />
                                </div>
                                <div className="user-share-cnt">
                                  <div className="user-share-inner">
                                    <p className="user-info">
                                      <span className="share-fullname">Đức Dũng Huỳnh</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </li>
                          </ul>
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
