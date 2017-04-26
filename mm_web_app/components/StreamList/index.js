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
import Loading from '../../components/Loading'
import { guid } from '../../utils/hash'

const LIMIT = 10
const masonryOptions = {
  itemSelector: '.grid-item',
  transitionDuration: 0
}

class StreamList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      hasMoreItems: false,
      currentPage: 1
    }
    this.loadMore = this.loadMore.bind(this)
  }

  loadMore () {
    const currentPage = this.state.currentPage + 1
    const hasMoreItems = currentPage * LIMIT <= this.props.urls.length
    this.setState({
      hasMoreItems,
      currentPage
    })
  }

  componentWillReceiveProps (props) {
    logger.info('componentWillReceiveProps', props)
    if (this.props.urls.length === props.urls.length) {
      const currentPage = this.state.currentPage + 1
      const hasMoreItems = currentPage * LIMIT <= this.props.urls.length
      this.setState({
        hasMoreItems,
        currentPage
      })
    } else {
      this.setState({
        hasMoreItems: true,
        currentPage: 1
      })
    }
  }

  render () {
    const { currentPage } = this.state
    const { urls } = this.props
    const items = []
    if (urls && urls.length) {
      const uniqUrls = _.uniqBy(urls, 'id')
      const maxScore = _.maxBy(uniqUrls, 'im_score')
      const sortedUrlsByHitUTC = _.reverse(_.sortBy(uniqUrls, [(url) => url.hit_utc]))
      const currentUrls = sortedUrlsByHitUTC.slice(0, currentPage * LIMIT)
      items.push(<div key={guid()} style={{ clear: 'both' }} />)
      _.forEach(currentUrls, (item) => {
        items.push(<StreamItem key={item.id} url={item} maxScore={maxScore.im_score} />)
      })
    }
    return (
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
    )
  }
 }

StreamList.propTypes = {
  urls: React.PropTypes.array
}

export default StreamList
