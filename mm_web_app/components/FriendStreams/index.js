/**
*
* YourStreams
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

const LIMIT = 10
const masonryOptions = {
  itemSelector: '.grid-item',
  transitionDuration: 0
}

var options = [
  { value: 'one', label: 'Topic One' },
  { value: 'two', label: 'Topic Two' }
]

function logChange (val) {
  console.log('Selected: ' + val)
}

class FriendStreams extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      hasMoreItems: false,
      currentPage: 1,
      urls: [],
      users: []
    }
    this.loadMore = this.loadMore.bind(this)
  }

  componentDidMount () {
    const { friends } = this.props
    let urls = []
    let users = []
    _.forEach(friends, friend => {
      const { user_id, fullname, avatar, list } = friend
      users.push({ user_id, fullname, avatar })
      _.forEach(list, item => {
        urls.push(...item.urls)
      })
    })
    this.setState({
      urls,
      users
    })
  }

  loadMore () {
    const currentPage = this.state.currentPage + 1
    const hasMoreItems = currentPage * LIMIT <= this.state.urls.length
    logger.warn('urls length', this.state.urls.length)
    logger.warn('currentPage', currentPage)
    logger.warn('hasMoreItems', hasMoreItems)
    this.setState({
      hasMoreItems,
      currentPage
    })
  }

  render () {
    const { currentPage, urls } = this.state
    const items = []
    logger.warn('urls', urls)
    if (urls && urls.length) {
      const uniqUrls = _.uniqBy(urls, 'id')
      const maxScore = _.maxBy(uniqUrls, 'im_score')
      const sortedUrlsByHitUTC = _.reverse(_.sortBy(uniqUrls, [(url) => url.hit_utc]))
      // TODO: support sort by time or score
      /* eslint-disable camelcase */
      const currentUrls = sortedUrlsByHitUTC.slice(0, currentPage * LIMIT)
      items.push(<div key={guid()} style={{ clear: 'both' }} />)
      _.forEach(currentUrls, (item) => {
        const { id, href, img, title, im_score, time_on_tab, hit_utc } = item
        const rate = Math.ceil((im_score / maxScore) * 5)
        let discoveryKeys = []
        if (item && item.suggestions_for_url && item.suggestions_for_url.length) {
          discoveryKeys = _.map(item.suggestions_for_url, 'term_name')
        }
        items.push(<div key={guid()} className='grid-item shuffle-item'>
          <div className='thumbnail-box'>
            <div className='thumbnail'>
              <div className='thumbnail-image'>
                <a href={href} target='_blank'>
                  <img src={img || '/static/images/no-image.png'} alt={title} />
                </a>
                <div className='mix-tag'><span className='tags' rel='tag'>Economy</span></div>
                <div className='scope-brand'>
                  <span>Earned XP {href.length} ({moment.duration(time_on_tab).humanize()})</span>
                </div>
                {discoveryKeys && discoveryKeys.length > 0 && <DiscoveryButton keys={discoveryKeys.join(',')} /> }
              </div>
              <div className='caption'>
                <h4 className='caption-title'>
                  <a href={href} target='_blank'>{title} ({id})</a>
                </h4>
                <div className='rating'>
                  <ReactStars edit={false} size={22} count={5} value={rate} />
                </div>
                <p><span className='date-time'><i className='fa fa-calendar-o' />
                  {moment.utc(hit_utc).fromNow()}
                </span></p>
                <div className='panel-user'>
                  <div className='panel-user-img'>
                    <a href='#' className='tooltip-user' title='Melissa McBride'><img src='../static/images/default_30.png' width='40' height='40' alt='' /></a>
                  </div>
                  <div className='panel-user-img'>
                    <a href='#' className='tooltip-user' title='Helen Adamson'><img src='../static/images/avatar.jpg' width='40' height='40' alt='' /></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>)
      })
    }
    return (
      <div className='container'>
        <div className='ReactTabs react-tabs'>
          <div className='ReactTabs__TabPanel ReactTabs__TabPanel--selected' role='tabpanel' id='react-tabs-1'>
            <div className='standand-sort'>
              <nav className='navbar'>
                <ul className='nav navbar-nav'>
                  <li>
                    <div>
                      <span>Topic</span>
                      <Select
                        name='topic-name'
                        value=''
                        options={options}
                        onChange={logChange}
                        />
                    </div>
                  </li>
                  <li>
                    <div>
                      <span>User</span>
                      <Select
                        name='user-name'
                        value=''
                        options={options}
                        onChange={logChange}
                        />
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
              threshold={300}
            >
              <Masonry className='container-masonry' options={masonryOptions}>
                <div className='grid-row'>
                  {items}
                </div>
              </Masonry>
            </InfiniteScroll>
          </div>
        </div>
      </div>
    )
  }
}

FriendStreams.propTypes = {
  friends: PropTypes.array.isRequired
}

export default FriendStreams
