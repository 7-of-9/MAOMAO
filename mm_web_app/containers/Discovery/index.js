import React, { Component } from 'react'
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
  transitionDuration: '0.4s',
  columnWidth: '.grid-sizer',
  percentPosition: true
}

function mashUp (store, masonry) {
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
  const vimeos = []
  const twitters = []
  const { redditResult, googleResult, googleNewsResult, googleKnowledgeResult, youtubeResult, twitterResult, vimeoResult } = store
  if (googleKnowledgeResult && googleKnowledgeResult.length) {
    _.forEach(googleKnowledgeResult, (item) => {
      const moreDetailUrl = (item.result && item.result.detailedDescription && item.result.detailedDescription.url) || (item.result && item.result.url)
      if (!urls.includes(moreDetailUrl) && moreDetailUrl && item.result.image && item.result.image.contentUrl) {
        urls.push(moreDetailUrl)
        graphKnowledges.push(
          <BlockElement
            key={`GK-${moreDetailUrl}`}
            name={item.result.name}
            description={(item.result.detailedDescription && item.result.detailedDescription.articleBody) || item.result.description}
            image={item.result.image && item.result.image.contentUrl}
            url={moreDetailUrl}
            type={'Google Knowledge'}
            masonry={masonry}
            />)
      }
    })
  }
  if (googleNewsResult && googleNewsResult.length) {
    _.forEach(googleNewsResult, (item) => {
      if (item.img && item.url && !urls.includes(item.url)) {
        urls.push(item.url)
        news.push(
          <BlockElement
            key={`GN-${item.url}`}
            name={item.title}
            description={item.description}
            url={item.url}
            image={item.img}
            type={'Google News'}
            masonry={masonry}
            />)
      }
    })
  }
  if (googleResult && googleResult.length) {
    _.forEach(googleResult, (item) => {
      if (item.img && item.url && !urls.includes(item.url)) {
        urls.push(item.url)
        search.push(
          <BlockElement
            key={`GS-${item.url}`}
            name={item.title}
            description={item.description}
            url={item.url}
            image={item.img}
            type={'Google Search'}
            masonry={masonry}
            />)
      }
    })
  }
  if (youtubeResult && youtubeResult.length) {
    _.forEach(youtubeResult, (item) => {
      const youtubeUrl = `https://www.youtube.com/watch?v=${item.id.videoId}`
      if (item.snippet && item.snippet.thumbnails && item.snippet.thumbnails.medium.url && !urls.includes(youtubeUrl)) {
        urls.push(youtubeUrl)
        videos.push(
          <BlockElement
            key={`YT-${youtubeUrl}`}
            name={item.snippet.title}
            description={item.snippet.description}
            image={item.snippet.thumbnails && item.snippet.thumbnails.medium.url}
            url={youtubeUrl}
            type={'Youtube'}
            masonry={masonry}
            />)
      }
    })
  }
  if (redditResult && redditResult.length) {
    _.forEach(redditResult, (item) => {
      if (item.preview && item.preview.images && item.preview.images[0] && item.url && !urls.includes(item.url)) {
        urls.push(item.url)
        const img = item.preview.images[0].resolutions.length ? item.preview.images[0].resolutions[item.preview.images[0].resolutions.length - 1].url : '/static/images/no-image.png'
        reddits.push(
          <BlockElement
            key={`YT-${item.url}`}
            name={item.title}
            description={item.selftext || item.title}
            image={img}
            url={`https://www.reddit.com${item.permalink}`}
            type={'Reddit'}
            masonry={masonry}
            />)
      }
    })
  }

  if (twitterResult && twitterResult.length) {
    const uniqTwitterResult = _.uniqBy(twitterResult, 'id_str')
    _.forEach(uniqTwitterResult, (item) => {
      const url = `https://twitter.com/${item.user.screen_name}/status/${item.id_str}`
      urls.push(url)
      twitters.push(
        <BlockElement
          key={`TW-${url}`}
          name={item.user.name}
          description={item.text}
          image={item.user.profile_image_url}
          url={url}
          type={'Twitter'}
          masonry={masonry}
            />)
    })
  }

  if (vimeoResult && vimeoResult.length) {
    const uniqVimeoResult = _.uniqBy(vimeoResult, 'link')
    _.forEach(uniqVimeoResult, (item) => {
      const replace = String.prototype.replace
      const link = replace.call(item.uri, '/videos', 'https://vimeo.com')
      urls.push(link)
      const img = item.pictures && item.pictures.sizes.length ? item.pictures.sizes[item.pictures.sizes.length - 1].link : '/static/images/no-image.png'
      vimeos.push(
        <BlockElement
          key={`VM-${item.link}`}
          name={item.name}
          description={item.description}
          image={img}
          url={link}
          type={'Vimeo'}
          masonry={masonry}
          />)
    })
  }
  // Mashup records
  const result = [graphKnowledges, news, search, reddits, twitters, vimeos, videos]
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
class Discovery extends Component {
  constructor (props) {
    super(props)
    this.loadMore = this.loadMore.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onLayout = this.onLayout.bind(this)
  }

  onLayout () {
    this.masonry && this.masonry.layout()
  }

  componentDidMount () {
    logger.warn('terms', this.props.terms)
    if (this.props.terms.length) {
      this.props.discovery.changeTerms(this.props.terms)
    }
  }

  loadMore () {
    logger.warn('loadMore')
    this.props.discovery.loadMore()
  }

  onChange (terms) {
    logger.warn('onChange terms', terms)
    this.props.discovery.changeTerms(terms)
  }

  render () {
    logger.warn('Discovery render', this.props)
    return (
      <div>
        <div className='back'>
          <button className='btn btn-back' onClick={this.props.onGoBack}>
            <i className='fa fa-angle-left' aria-hidden='true' />
          </button>
        </div>
        <div className='bounceInRight animated'>
          <StickyContainer>
            <Sticky>
              {
              ({style}) => {
                return (
                  <div style={{...style, zIndex: 1000, backgroundColor: '#fff'}} className='standand-sort'>
                    <SearchBar terms={this.props.terms} suggestions={this.props.suggestions} onChange={this.onChange} />
                  </div>
                )
              }
            }
            </Sticky>
            <InfiniteScroll
              pageStart={0}
              loadMore={this.loadMore}
              hasMore={this.props.discovery.hasMore}
              >
              <Masonry
                className='container-masonry'
                options={masonryOptions}
                updateOnEachImageLoad
                onImagesLoaded={this.onLayout}
                ref={(c) => { this.masonry = this.masonry || c.masonry }}
                >
                <div className='grid-row'>
                  <div className='grid-sizer' />
                  {mashUp(toJS(this.props.discovery), this.masonry)}
                </div>
              </Masonry>
            </InfiniteScroll>
            <Loading isLoading={this.props.discovery.pendings.length > 0} />
          </StickyContainer>
        </div>
      </div>
    )
  }
}

Discovery.propTypes = {
  terms: PropTypes.array.isRequired,
  suggestions: PropTypes.array,
  onGoBack: PropTypes.func.isRequired
}

export default Discovery
