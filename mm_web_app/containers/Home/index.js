/*
 *
 * Home
 *
 */

import React from 'react'
import dynamic from 'next/dynamic'
import { observer, inject } from 'mobx-react'
import Head from 'next/head'
import Router from 'next/router'
import Raven from 'raven-js'
import { Footer, Page } from 'neal-react'
import NProgress from 'nprogress'
import { FACEBOOK_APP_ID, MAOMAO_SITE_URL } from '../../containers/App/constants'
import Loading from '../../components/Loading'
import Notification from '../../components/Notification'
import AddToHome from '../../components/AddToHome'
import logger from '../../utils/logger'

// dynaymic load container component

const AppHeader = dynamic(
 import('../AppHeader'),
  {
    loading: () => (<Loading isLoading />),
    ssr: false
  }
)

const Discovery = dynamic(
 import('../Discovery'),
  {
    loading: () => (<Loading isLoading />)
  }
)

const Share = dynamic(
 import('../Share'),
  {
    loading: () => (<Loading isLoading />)
  }
)

const ShareList = dynamic(
import('../../components/ShareList'),
  {
    loading: () => (<Loading isLoading />)
  }
)

const Streams = dynamic(
import('../../components/Streams'),
  {
    loading: () => (<Loading isLoading />),
    ssr: false
  }
)

const TopicTree = dynamic(
import('../../components/TopicTree'),
  {
    loading: () => (<Loading isLoading />)
  }
)

const SelectedPanel = dynamic(
import('../../components/SelectedPanel'),
  {
    loading: () => (<Loading isLoading />),
    ssr: false
  }
)

Router.onRouteChangeStart = (url) => {
  NProgress.start()
}
Router.onRouteChangeComplete = () => NProgress.done()
Router.onRouteChangeError = () => NProgress.done()

const brandName = 'maomao'
const businessAddress = (
  <address>
    <img src='/static/images/maomao.png' className='logo-image' alt='maomao' />
  </address>
)

@inject('store')
@inject('ui')
@observer
class Home extends React.Component {
  state = {
    hasAddToHome: false
  }

  addToHomeOnMobile = () => {
    logger.warn('Home addToHomeOnMobile')
    if (this.props.isMobile) {
      this.addToHome.show(true)
      this.setState({
        hasAddToHome: true
      })
    }
  }

  componentDidMount () {
    logger.warn('Home componentDidMount')
    Raven.config('https://85aabb7a13e843c5a992da888d11a11c@sentry.io/191653').install()
    this.props.store.getTopicTree()
    if (this.props.store.userId > 0) {
      this.props.store.getUserHistory()
    }
    if (this.props.isMobile) {
      // TODO: support chrome (android)
      if (window.navigator.standalone) {
        this.setState({
          hasAddToHome: true
        })
      } else {
        /* eslint-disable no-undef */
        this.addToHome = addToHomescreen({
          autostart: false,
          appID: 'org.maomao.webApp',
          detectHomescreen: true,
          startDelay: 0
        })
        logger.warn('addToHome', this.addToHome)
      }
    }
  }

  renderViewer = (currentViewer) => {
    switch (currentViewer) {
      case 'share':
        return (<ShareList />)
      case 'sharetopic':
        return (<Share />)
      case 'discovery':
        return (<Discovery />)
      case 'streams':
      default:
        return (<Streams />)
    }
  }

  renderBaseOnAuthentication = () => {
    const { isLogin, isProcessing } = this.props.store
    const { currentViewer, selectedTopics } = this.props.ui
    if (isLogin) {
      return (
        <div className='wrapper-slide'>
          {this.renderViewer(currentViewer)}
          <Loading isLoading={isProcessing} />
        </div>
      )
    }
    const selectedItems = selectedTopics ? selectedTopics.map(item => ({img: item.img, id: item.termId, name: item.termName})) : []
    return (
      <div className='wrapper-slide'>
        <SelectedPanel
          items={selectedItems}
            />
        {
            currentViewer !== 'discovery' &&
            <TopicTree />
          }
        {
            currentViewer === 'discovery' &&
            <Discovery />
          }
      </div>)
  }

  render () {
    const title = 'maomao - discover & share'
    let description = 'maomao is a peer-to-peer real time content sharing network, powered by a deep learning engine.'
    const { shareInfo, bgImage, isMobile } = this.props.store
    if (shareInfo) {
      const { fullname, share_all: shareAll, topic_title: topicTitle, url_title: urlTitle } = shareInfo
      if (shareAll) {
        description = `${fullname} would like to share all maomao stream with you`
      } else if (urlTitle && urlTitle.length) {
        description = `${fullname} would like to share "${urlTitle}" with you`
      } else if (topicTitle && topicTitle.length) {
        description = `${fullname} would like to share the maomao stream with you: "${topicTitle}"`
      }
    }
    const { hasAddToHome } = this.state
    logger.warn('Home render', this.props)
    return (
      <Page>
        <Head>
          <meta charSet='utf-8' />
          <title>{title}</title>
          <meta name='apple-mobile-web-app-capable' content='yes' />
          <meta name='mobile-web-app-capable' content='yes' />
          <meta name='apple-mobile-web-app-title' content='Maomao' />
          <link rel='shortcut icon' type='image/x-icon' href='/static/favicon.ico' />
          <meta name='description' content={description} />
          <meta name='og:title' content={title} />
          <meta name='og:description' content={description} />
          <meta name='og:image' content={bgImage && bgImage.length > 0 ? bgImage : `${MAOMAO_SITE_URL}static/images/logo.png`} />
          <meta name='fb:app_id' content={FACEBOOK_APP_ID} />
          <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no' />
          <meta name='google-site-verification' content='AmFFr6xg5Htf_GFkf0psWvL1r9JKBMhGEkmAJ7UmafM' />
          <link rel='apple-touch-icon' href='/static/images/logo.png' />
          <link rel='icon' href='/static/images/logo.png' />
          <link rel='chrome-webstore-item' href='https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk' />
          <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css' />
          <link rel='stylesheet' href='/static/vendors/css/nprogress.css' />
          <link rel='stylesheet' href='/static/vendors/css/addtohomescreen.css' />
          <script src='/static/vendors/js/snoowrap-v1.min.js' />
          <script src='https://code.jquery.com/jquery-3.2.1.slim.min.js' />
          <script src='https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js' />
          <script src='https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js' />
          <script src='/static/vendors/js/addtohomescreen.min.js' />
        </Head>
        <AppHeader />
        { this.renderBaseOnAuthentication() }
        {
          isMobile && !hasAddToHome &&
          <AddToHome onClick={this.addToHomeOnMobile} />
         }
        <Notification />
        <div className='footer-area'>
          <Footer brandName={brandName}
            facebookUrl='https://www.facebook.com/maomao.hiring'
            address={businessAddress}
          />
        </div>
      </Page>
    )
  }
}

export default Home
