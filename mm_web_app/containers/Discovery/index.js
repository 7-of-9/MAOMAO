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
import NProgress from 'nprogress'
import * as logger from 'loglevel'
import { FACEBOOK_APP_ID, MAOMAO_SITE_URL } from '../../containers/App/constants'
// import Block from '../../components/Block'
import Loading from '../../components/Loading'
import Header from '../../components/Header'
import SearchBar from '../../components/SearchBar'
import LogoIcon from '../../components/LogoIcon'
import Slogan from '../../components/Slogan'

const SRRLoading = () => (<div>Loading...</div>)

Router.onRouteChangeStart = (url) => {
  logger.info(`Loading: ${url}`)
  NProgress.start()
}
Router.onRouteChangeComplete = () => NProgress.done()
Router.onRouteChangeError = () => NProgress.done()

const brandName = 'MaoMao'
const brand = <Header><LogoIcon /><Slogan /></Header>
const businessAddress = (
  <address>
    <strong>{brandName}</strong><br />
    Singapore<br />
  </address>
)

@inject('store') @observer
export class Discovery extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false
    }
    this.loadMore = this.loadMore.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onSearch = this.onSearch.bind(this)
    logger.warn('Discovery', this.props)
  }

  loadMore () {

  }

  onChange (terms) {
    this.props.store.changeTerms(terms)
  }

  onSearch (evt) {
    if (evt !== undefined && evt.preventDefault) {
      evt.preventDefault()
    }
    this.props.store.search(1)
  }

  render () {
    const title = 'MaoMao - Discovery page'
    const description = 'Maomao is a peer-to-peer real time content sharing network, powered by a deep learning engine.'
    let elements = []
    const terms = toJS(this.props.store.terms)
    logger.warn('terms', terms)
    return (
      <Page>
        <Head>
          <meta charSet='utf-8' />
          <title>{title}</title>
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
          <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css' />
          <link rel='stylesheet' href='/static/vendors/css/nprogress.css' />
        </Head>
        <Navbar brand={brand}>
          <NavItem><Link prefetch href='/' className='nav-link'>Home</Link></NavItem>
          <NavItem><Link href='/discovery' className='nav-link'>Discovery</Link></NavItem>
          <NavItem><Link prefetch href='/hiring' className='nav-link'>Hiring</Link></NavItem>
        </Navbar>
        <StickyContainer className='container-fluid'>
          <Sticky>
            <SearchBar terms={terms} onChange={this.onChange} onSearch={this.onSearch} />
          </Sticky>
          {
          elements.length > 0 &&
          <NoSSR onSSR={<SRRLoading />}>
            <InfiniteScroll
              loadMore={this.loadMore}
              hasMore={this.state.loading}
              threshold={200}
            >
              {elements}
            </InfiniteScroll>
          </NoSSR>
          }
          <Loading isLoading={this.state.loading} />
        </StickyContainer>
        <Footer brandName={brandName}
          facebookUrl='http://www.facebook.com'
          twitterUrl='http://www.twitter.com/'
          address={businessAddress}
        />
      </Page>
    )
  }
}

Discovery.propTypes = {
  terms: PropTypes.array
}

export default Discovery
