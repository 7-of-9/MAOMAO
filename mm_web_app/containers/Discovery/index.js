import React from 'react'
import PropTypes from 'prop-types'
import Head from 'next/head'
import { Footer, Navbar, NavItem, Page } from 'neal-react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import { StickyContainer, Sticky } from 'react-sticky'
import NoSSR from 'react-no-ssr'
import Router from 'next/router'
import Link from 'next/link'
import InfiniteScroll from 'react-infinite-scroller'
import Masonry from 'react-masonry-component'
import NProgress from 'nprogress'
import { List } from 'immutable'
import _ from 'lodash'
import { FACEBOOK_APP_ID, MAOMAO_SITE_URL } from '../../containers/App/constants'
import BlockElement from '../../components/BlockElement'
import Loading from '../../components/Loading'
import Header from '../../components/Header'
import SearchBar from '../../components/SearchBar'
import LogoIcon from '../../components/LogoIcon'
import Slogan from '../../components/Slogan'

Router.onRouteChangeStart = (url) => {
  NProgress.start()
}
Router.onRouteChangeComplete = () => NProgress.done()
Router.onRouteChangeError = () => NProgress.done()

const brandName = 'maomao'
const brand = <Header><LogoIcon /><Slogan /></Header>
const businessAddress = (
  <address>
    <img src='/static/images/maomao.png' className='logo-image' alt='maomao' />
    Singapore<br />
  </address>
)

const masonryOptions = {
  itemSelector: '.grid-item',
  transitionDuration: 0
}

function mashUp (store) {
  // Parse data
  if (store.terms.length === 0) {
    return []
  }
  let urls = List([])
  const graphKnowledges = []
  const search = []
  const news = []
  const videos = []
  const reddits = []
  const { redditResult, googleResult, googleNewsResult, googleKnowledgeResult, youtubeResult } = store
  if (googleKnowledgeResult.length || youtubeResult.length || googleNewsResult.length || googleResult.length || redditResult.length) {
    _.forEach(googleKnowledgeResult, (item) => {
      const moreDetailUrl = (item.result.detailedDescription && item.result.detailedDescription.url) || item.result.url
      if (!urls.includes(moreDetailUrl) && moreDetailUrl && item.result.image && item.result.image.contentUrl) {
        urls = urls.insert(urls.size, moreDetailUrl)
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
    _.forEach(googleNewsResult, (item) => {
      if (item.img && item.url && !urls.includes(item.url)) {
        urls = urls.insert(urls.size, item.url)
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
    _.forEach(googleResult, (item) => {
      if (item.img && item.url && !urls.includes(item.url)) {
        urls = urls.insert(urls.size, item.url)
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
    _.forEach(youtubeResult, (item) => {
      const youtubeUrl = `https://www.youtube.com/watch?v=${item.id.videoId}`
      if (item.snippet.thumbnails && item.snippet.thumbnails.medium.url && !urls.includes(youtubeUrl)) {
        urls = urls.insert(urls.size, youtubeUrl)
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
    _.forEach(redditResult, (item) => {
      if (item.preview && item.preview.images && item.preview.images[0] && item.url && !urls.includes(item.url)) {
        urls = urls.insert(urls.size, item.url)
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

@inject('store')
@observer
class Discovery extends React.Component {
  constructor (props) {
    super(props)
    this.loadMore = this.loadMore.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onSearch = this.onSearch.bind(this)
  }

  loadMore () {
    this.props.store.loadMore()
  }

  onChange (terms) {
    this.props.store.changeTerms(terms)
  }

  onSearch (evt) {
    if (evt !== undefined && evt.preventDefault) {
      evt.preventDefault()
    }
    this.props.store.loadMore()
  }

  render () {
    const title = 'maomao - peer-to-peer real time content sharing network - discovery mode'
    const description = 'maomao is a peer-to-peer real time content sharing network, powered by a deep learning engine.'
    const terms = toJS(this.props.store.terms)
    return (
      <Page>
        <Head>
          <meta charSet='utf-8' />
          <title>{title}</title>
          <link rel='shortcut icon' type='image/x-icon' href='/static/favicon.ico' />
          <meta name='description' content={description} />
          <meta name='og:title' content={title} />
          <meta name='og:description' content={description} />
          <meta name='og:image' content={`${MAOMAO_SITE_URL}static/images/logo.png`} />
          <meta name='fb:app_id' content={FACEBOOK_APP_ID} />
          <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no' />
          <link rel='chrome-webstore-item' href='https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk' />
          <script src='https://code.jquery.com/jquery-3.1.1.slim.min.js' />
          <script src='https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js' />
          <script src='https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js' />
          <script src='/static/vendors/js/snoowrap-v1.min.js' />
          <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css' />
          <link rel='stylesheet' href='/static/vendors/css/nprogress.css' />
        </Head>
        <Navbar className='header-nav animated fadeInDown' brand={brand}>
          <NavItem><Link href='/' className='nav-link'><a href='/'>Home</a></Link></NavItem>
          <NavItem><Link href='/discovery' className='nav-link'><a href='/discovery'>Discovery</a></Link></NavItem>
          <NavItem><Link href='/hiring' className='nav-link'><a href='/hiring'>Hiring</a></Link></NavItem>
        </Navbar>
        <StickyContainer className='container'>
          <Sticky style={{zIndex: 1000, backgroundColor: '#fff'}}>
            <SearchBar terms={terms} onChange={this.onChange} onSearch={this.onSearch} />
          </Sticky>
          <NoSSR onSSR={<Loading isLoading />}>
            <InfiniteScroll
              pageStart={0}
              loadMore={this.loadMore}
              hasMore={this.props.store.hasMore}
              className='container-fluid'
              >
              <Masonry className='container-masonry' options={masonryOptions}>
                <div className='grid-row'>{mashUp(toJS(this.props.store))}</div>
              </Masonry>
              <Loading isLoading={this.props.store.pendings.length > 0} />
            </InfiniteScroll>
          </NoSSR>
        </StickyContainer>
        <div className='footer-area'>
          <Footer brandName={brandName}
            facebookUrl='http://www.facebook.com'
            twitterUrl='http://www.twitter.com/'
            address={businessAddress}
          />
        </div>
      </Page>
    )
  }
}

Discovery.propTypes = {
  terms: PropTypes.array
}

export default Discovery
