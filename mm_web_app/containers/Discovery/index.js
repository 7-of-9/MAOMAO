import React from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import { StickyContainer, Sticky } from 'react-sticky'
import Router from 'next/router'
import InfiniteScroll from 'react-infinite-scroller'
import Masonry from 'react-masonry-component'
import NProgress from 'nprogress'
import _ from 'lodash'
import BlockElement from '../../components/BlockElement'
import Loading from '../../components/Loading'
import SearchBar from '../../components/SearchBar'
import logger from '../../utils/logger'

Router.onRouteChangeStart = (url) => {
  NProgress.start()
}
Router.onRouteChangeComplete = () => NProgress.done()
Router.onRouteChangeError = () => NProgress.done()

const masonryOptions = {
  itemSelector: '.grid-item',
  transitionDuration: '0.4s'
}

function mashUp (store) {
  // Parse data
  if (store.terms.length === 0) {
    return []
  }
  let urls = []
  const graphKnowledges = []
  const search = []
  const news = []
  const videos = []
  const reddits = []
  const { redditResult, googleResult, googleNewsResult, googleKnowledgeResult, youtubeResult } = store
  if (googleKnowledgeResult && googleKnowledgeResult.length) {
    _.forEach(googleKnowledgeResult, (item) => {
      const moreDetailUrl = (item.result.detailedDescription && item.result.detailedDescription.url) || item.result.url
      if (!urls.includes(moreDetailUrl) && moreDetailUrl && item.result.image && item.result.image.contentUrl) {
        urls.push(moreDetailUrl)
        graphKnowledges.push(
          <div className='grid-item' key={`GK-${moreDetailUrl}`}>
            <BlockElement
              name={item.result.name}
              description={(item.result.detailedDescription && item.result.detailedDescription.articleBody) || item.result.description}
              image={item.result.image && item.result.image.contentUrl}
              url={moreDetailUrl}
              type={'Google Knowledge'}
            />
          </div>)
      }
    })
  }
  if (googleNewsResult && googleNewsResult.length) {
    _.forEach(googleNewsResult, (item) => {
      if (item.img && item.url && !urls.includes(item.url)) {
        urls.push(item.url)
        news.push(
          <div className='grid-item' key={`GN-${item.url}`}>
            <BlockElement
              name={item.title}
              description={item.description}
              url={item.url}
              image={item.img}
              type={'Google News'}
            />
          </div>)
      }
    })
  }
  if (googleResult && googleResult.length) {
    _.forEach(googleResult, (item) => {
      if (item.img && item.url && !urls.includes(item.url)) {
        urls.push(item.url)
        search.push(
          <div className='grid-item' key={`GS-${item.url}`}>
            <BlockElement
              name={item.title}
              description={item.description}
              url={item.url}
              image={item.img}
              type={'Google Search'}
            />
          </div>)
      }
    })
  }
  if (youtubeResult && youtubeResult.length) {
    _.forEach(youtubeResult, (item) => {
      const youtubeUrl = `https://www.youtube.com/watch?v=${item.id.videoId}`
      if (item.snippet.thumbnails && item.snippet.thumbnails.medium.url && !urls.includes(youtubeUrl)) {
        urls.push(youtubeUrl)
        videos.push(
          <div className='grid-item' key={`YT-${youtubeUrl}`}>
            <BlockElement
              name={item.snippet.title}
              description={item.snippet.description}
              image={item.snippet.thumbnails && item.snippet.thumbnails.medium.url}
              url={youtubeUrl}
              type={'Youtube'}
            />
          </div>)
      }
    })
  }
  if (redditResult && redditResult.length) {
    _.forEach(redditResult, (item) => {
      if (item.preview && item.preview.images && item.preview.images[0] && item.url && !urls.includes(item.url)) {
        urls.push(item.url)
        reddits.push(
          <div className='grid-item' key={`RD-${item.url}`}>
            <BlockElement
              name={item.title}
              description={item.selftext || item.title}
              image={item.preview.images[0].resolutions[item.preview.images[0].resolutions.length - 1].url}
              url={item.url}
              type={'Reddit'}
            />
          </div>)
      }
    })
  }
  // Mashup records
  const result = [graphKnowledges, news, search, reddits, videos]
  const elements = []
  const numberItems = _.map(result, (item) => item.length)
  const maxItems = _.max(numberItems)
  for (let index = 0; index < maxItems; index += 1) {
    for (let count = 0; count < result.length; count += 1) {
      if (result[count] && result[count][index]) {
        elements.push(result[count][index])
      }
    }
  }
  return elements
}

@inject('discovery')
@inject('ui')
@observer
class Discovery extends React.Component {
  constructor (props) {
    super(props)
    this.loadMore = this.loadMore.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onSearch = this.onSearch.bind(this)
  }

  componentDidMount () {
    logger.warn('terms', this.props.terms)
    if (this.props.terms.length) {
      this.props.discovery.changeTerms(this.props.terms)
    }
  }

  loadMore () {
    this.props.discovery.loadMore()
  }

  onChange (terms) {
    this.props.discovery.changeTerms(terms)
  }

  onSearch (evt) {
    if (evt !== undefined && evt.preventDefault) {
      evt.preventDefault()
    }
    this.props.discovery.loadMore()
  }

  render () {
    logger.warn('Discovery render', this.props)
    return (
      <div>
        <div className='back'>
          <button onClick={() => { this.props.ui.openDiscoveryMode([]) }}> Back
          </button>
          <h1> Discovery mode </h1>
        </div>
        <StickyContainer className='container'>
          <Sticky>
            {
              ({style}) => {
                return (
                  <div style={{...style, zIndex: 1000, backgroundColor: '#fff'}}>
                    <SearchBar terms={this.props.terms} onChange={this.onChange} onSearch={this.onSearch} />
                  </div>
                )
              }
            }
          </Sticky>
          <InfiniteScroll
            pageStart={0}
            loadMore={this.loadMore}
            hasMore={this.props.discovery.hasMore}
            className='container-fluid'
              >
            <Masonry className='container-masonry' options={masonryOptions}>
              <div className='grid-row'>{mashUp(toJS(this.props.discovery))}</div>
            </Masonry>
            <Loading isLoading={this.props.discovery.pendings.length > 0} />
          </InfiniteScroll>
        </StickyContainer>
      </div>
    )
  }
}

Discovery.propTypes = {
  terms: PropTypes.array.isRequired
}

export default Discovery
