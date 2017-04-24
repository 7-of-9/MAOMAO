/**
*
* StreamList
*
*/

import React from 'react'
import _ from 'lodash'
import * as logger from 'loglevel'
import InfiniteScroll from 'react-infinite-scroller'
import Masonry from 'react-masonry-component'
import StreamItem from '../../components/StreamItem'
// import Loading from '../../components/Loading'

const LIMIT = 10
const masonryOptions = {
  itemSelector: '.grid-item',
  transitionDuration: 0,
  columnWidth: 200
}

class StreamList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      hasMoreItems: false,
      currentPage: 1
    }
    logger.warn('StreamList', props)
    this.loadMore = this.loadMore.bind(this)
  }

  componentDidMount () {
    logger.warn('componentDidMount StreamList', this.state, this.props)
  }

  loadMore () {
    const currentPage = this.state.currentPage + 1
    const hasMoreItems = currentPage * LIMIT <= this.props.urls.length
    logger.warn('urls length', this.props.urls.length, this.props)
    logger.warn('currentPage', currentPage)
    logger.warn('hasMoreItems', hasMoreItems)
    this.setState({
      hasMoreItems,
      currentPage
    })
  }

  componentWillReceiveProps (props) {
    logger.warn('componentWillReceiveProps', props)
    if (this.props.urls.length === props.urls.length) {
      const currentPage = this.state.currentPage + 1
      const hasMoreItems = currentPage * LIMIT <= this.props.urls.length
      logger.warn('urls length', this.props.urls.length, this.props)
      logger.warn('currentPage', currentPage)
      logger.warn('hasMoreItems', hasMoreItems)
      this.setState({
        hasMoreItems,
        currentPage,
        isUpdating: true
      })
    } else {
      this.setState({
        hasMoreItems: true,
        currentPage: 1,
        isUpdating: true
      })
    }

    setTimeout(() => {
      this.setState({
        isUpdating: false
      })
    }, _.max(props.urls.length * 10, 200))
  }

  componentWillUnmount () {
    logger.info('componentWillUnmount StreamList')
  }

  render () {
    const { currentPage } = this.state
    const { urls } = this.props
    const items = []
    if (urls && urls.length) {
      const maxScore = _.maxBy(urls, 'im_score')
      const sortedUrlsByHitUTC = _.reverse(_.sortBy(urls, [(url) => url.hit_utc]))
      const currentUrls = sortedUrlsByHitUTC.slice(0, currentPage * LIMIT)
      logger.warn('currentUrls', currentPage, currentUrls)
      items.push(<div key={Date.now() + 1} style={{ clear: 'both' }} />)
      _.forEach(currentUrls, (item) => {
        items.push(<StreamItem key={item.id} url={item} maxScore={maxScore.im_score} />)
      })
    }
    return (
      <InfiniteScroll
        pageStart={0}
        loadMore={this.loadMore}
        hasMore={this.state.hasMoreItems}
        >
        <Masonry className='container-fluid' options={masonryOptions}>
          {items}
        </Masonry>
      </InfiniteScroll>
    )
  }
 }

StreamList.propTypes = {
  urls: React.PropTypes.array
}

export default StreamList
