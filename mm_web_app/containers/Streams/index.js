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
import ReactStars from 'react-stars'
import moment from 'moment'
import _ from 'lodash'
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
                {urlOwner(id, users, (user) => this.props.ui.selectUser(user))}
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
              ({style}) => {
                return (
                  <div style={{...style, margin: '0', zIndex: 1000, backgroundColor: '#fff'}} className='standand-sort'>
                    <nav className='navbar'>
                      <ul className='nav navbar-nav' >
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
                      </ul>
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
