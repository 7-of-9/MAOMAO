/*
 *
 * Home
 *
 */

import React from 'react'
import PropTypes from 'prop-types'
import { observer, inject } from 'mobx-react'
import { toJS } from 'mobx'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Router from 'next/router'
import { NotificationStack } from 'react-notification'
import { Footer, Page, Section } from 'neal-react'
import ToggleDisplay from 'react-toggle-display'
import NProgress from 'nprogress'
import { FACEBOOK_APP_ID, MAOMAO_SITE_URL } from '../../containers/App/constants'
import AppHeader from '../AppHeader'
import Loading from '../../components/Loading'
import AddToHome from '../../components/AddToHome'
import logger from '../../utils/logger'

// dynaymic load container component
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

const ChromeInstall = dynamic(
 import('../ChromeInstall'),
  {
    ssr: false,
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
    loading: () => (<Loading isLoading />)
  }
)

const TopicTree = dynamic(
import('../../components/TopicTree'),
  {
    loading: () => (<Loading isLoading />)
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

  onInstallSucess = () => {
    this.props.ui.addNotification('Yeah! You have been installed maomao extension successfully.')
    setTimeout(() => {
      this.props.store.checkEnvironment()
      this.props.store.checkInstall()
      window.location.reload()
    }, 1000)
  }

  onInstallFail = (error) => {
    this.props.ui.addNotification(error)
  }

  addNotification = (msg) => {
    this.props.ui.addNotification(msg)
  }

  inlineInstall = () => {
    /* eslint-disable */
    chrome.webstore.install(
    'https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk',
    this.onInstallSucess,
    this.onInstallFail)
    /* eslint-enable */
  }

  removeNotification = (uuid) => {
    this.props.ui.removeNotification(uuid)
  }

  addToHomeOnMobile = () => {
    logger.warn('Home addToHomeOnMobile')
    if (this.props.store.isMobile) {
      this.addToHome.show(true)
      this.setState({
        hasAddToHome: true
      })
    }
  }

  goBack = (evt) => {
    evt.preventDefault()
    this.props.ui.openDiscoveryMode([])
  }

  onDismiss = (uuid) => {
    this.props.ui.removeNotification(uuid)
  }

  componentDidMount () {
    logger.warn('Home componentDidMount')
    this.props.store.getTopicTree()
    /* global Raven */
    Raven.config('https://85aabb7a13e843c5a992da888d11a11c@sentry.io/191653').install()
    if (this.props.store.isMobile) {
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

  componentWillReact () {
    logger.warn('Home componentWillReact')
  }

  componentWillUnmount () {
    logger.warn('Home componentWillUnmount')
    this.props.ui.clearNotifications()
  }

  render () {
    const title = 'maomao - discover & share'
    let description = 'maomao is a peer-to-peer real time content sharing network, powered by a deep learning engine.'
    const { isLogin, isInstall, isProcessing, shareInfo, bgImage, urls, users, isMobile } = this.props.store
    const { notifications } = this.props.ui
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
    logger.warn('Home urls, users', toJS(urls), toJS(users))
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
          <script src='https://cdn.ravenjs.com/3.17.0/raven.min.js' crossOrigin='anonymous' />
          <script src='/static/vendors/js/addtohomescreen.min.js' />
        </Head>
        <AppHeader notify={this.addNotification} />
        <NotificationStack
          notifications={notifications.slice()}
          dismissAfter={5000}
          onDismiss={this.onDismiss}
        />
        <ToggleDisplay if={!isLogin}>
          <ChromeInstall
            description={description}
            title='Unlock YOUR FRIEND STREAM Now'
            install={this.inlineInstall}
            />
          <Loading isLoading={isProcessing} />
          <div className='wrapper-slide'>
            <TopicTree />
            {
              this.props.ui.currentViewer === 'discovery' &&
              <Discovery suggestions={toJS(this.props.ui.discoverySuggestionTerms)} terms={toJS(this.props.ui.discoveryTerms)} onGoBack={this.goBack} />
            }
          </div>
        </ToggleDisplay>
        <ToggleDisplay if={isLogin}>
          <ChromeInstall
            description={description}
            title='Unlock YOUR FRIEND STREAM Now'
            install={this.inlineInstall}
            />
          <Loading isLoading={isProcessing} />
          <div className='wrapper-slide'>
            {
                this.props.ui.currentViewer === 'share' &&
                <ShareList />
              }
            {
                this.props.ui.currentViewer === 'sharetopic' &&
                <Share />
              }
            {
                this.props.ui.currentViewer === 'discovery' &&
                <Discovery suggestions={toJS(this.props.ui.discoverySuggestionTerms)} terms={toJS(this.props.ui.discoveryTerms)} onGoBack={this.goBack} />
              }
            {
              urls.length > 0 && users.length > 0 && this.props.ui.currentViewer === 'streams' &&
              <Streams />
              }
            {
              urls.length === 0 && !isProcessing &&
              <Section className='section-empty-list' style={{ backgroundColor: '#fff' }}>
                {
                  isInstall && <h3>Congratulations for installing <img src='/static/images/maomao.png' className='maomao-img' alt='maomao' /> !</h3>
                }
                <p>
                  Now you can start browsing and sharing with your friends. Come back here after you’ve shared with your friends.
                </p>
              </Section>
              }
          </div>
        </ToggleDisplay>
        {
          isMobile && !hasAddToHome &&
          <AddToHome onClick={this.addToHomeOnMobile} />
         }
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

Home.propTypes = {
  history: PropTypes.object,
  home: PropTypes.object,
  loading: PropTypes.bool,
  notifications: PropTypes.object,
  changeNotifications: PropTypes.func,
  inlineInstall: PropTypes.func,
  onChangeTerm: PropTypes.func,
  onChangeFriendStream: PropTypes.func
}

export default Home
