/*
 *
 * Home
 *
 */

import React from 'react'
import PropTypes from 'prop-types'
import Head from 'next/head'
import Router from 'next/router'
import Link from 'next/link'
import { inject, observer } from 'mobx-react'
// import NoSSR from 'react-no-ssr'
import { NotificationStack } from 'react-notification'
import { OrderedSet } from 'immutable'
import * as logger from 'loglevel'
import {
  Footer, Navbar, NavItem, Page
} from 'neal-react'
import NProgress from 'nprogress'
import { FACEBOOK_APP_ID, MAOMAO_SITE_URL } from '../../containers/App/constants'
import AppHeader from '../../containers/AppHeader'
import Header from '../../components/Header'
import LogoIcon from '../../components/LogoIcon'
import Slogan from '../../components/Slogan'
import ChromeInstall from '../../components/ChromeInstall'

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
class Home extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      notifications: OrderedSet(),
      count: 0
    }
    this.onInstallSucess = this.onInstallSucess.bind(this)
    this.onInstallFail = this.onInstallFail.bind(this)
    this.inlineInstall = this.inlineInstall.bind(this)
    this.addNotification = this.addNotification.bind(this)
    this.removeNotification = this.removeNotification.bind(this)
  }

  onInstallSucess () {
    this.addNotification('Yeah! You have been installed maomao extension successfully.')
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  onInstallFail (error) {
    this.addNotification(error)
  }

  addNotification (msg) {
    const uuid = Date.now()
    return this.setState({
      notifications: this.state.notifications.add({
        message: msg,
        key: uuid,
        action: 'Dismiss',
        onClick: (deactivate) => {
          this.removeNotification(deactivate.key)
        }
      })
    })
  }

  inlineInstall () {
    /* global chrome */
    chrome.webstore.install(
      'https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk',
      this.onInstallSucess,
      this.onInstallFail)
  }

  removeNotification (uuid) {
    const notifications = this.state.notifications.filter((item) => item.key !== uuid)
    this.setState({
      notifications
    })
  }
  componentWillReact () {
    logger.warn('I will re-render, since the data has changed!')
  }
  componentDidMount () {
    logger.warn('componentDidMount', this.props)
    if (this.props.isClosePopup) {
      logger.warn('Close popup')
      window.close()
    }
    setTimeout(() => {
      this.props.store.checkAuth()
      this.props.store.checkInstall()
    }, 500)
  }
  render () {
    const title = 'MaoMao - Home page'
    let description = 'Maomao is a peer-to-peer real time content sharing network, powered by a deep learning engine.'
    if (this.props.store.shareInfo) {
      const { fullname, share_all: shareAll, topic_title: topicTitle, url_title: urlTitle } = this.props.store.shareInfo
      if (shareAll) {
        description = `${fullname} would like to share all MaoMao stream with you`
      } else if (urlTitle && urlTitle.length) {
        description = `${fullname} would like to share "${urlTitle}" with you`
      } else if (topicTitle && topicTitle.length) {
        description = `${fullname} would like to share the MaoMao stream with you: "${topicTitle}"`
      }
    }
    return (
      <Page style={{ display: this.props.isClosePopup ? 'none' : '' }}>
        <Head>
          <meta charSet='utf-8' />
          <title>{title}</title>
          <meta name='description' content={description} />
          <meta name='og:title' content={title} />
          <meta name='og:description' content={description} />
          <meta name='og:image' content={`${MAOMAO_SITE_URL}static/images/logo.png`} />
          <meta name='fb:app_id' content={FACEBOOK_APP_ID} />
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <link rel='chrome-webstore-item' href='https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk' />
          <script src='https://code.jquery.com/jquery-3.1.1.slim.min.js' />
          <script src='https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js' />
          <script src='https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js' />
          <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css' />
          <link rel='stylesheet' href='/static/vendors/css/nprogress.css' />
        </Head>
        <Navbar brand={brand}>
          <NavItem><Link href='/' className='nav-link'>Home</Link></NavItem>
          <NavItem><Link prefetch href='/discovery' className='nav-link'>Discovery</Link></NavItem>
          <NavItem><Link prefetch href='/hiring' className='nav-link'>Hiring</Link></NavItem>
          <AppHeader notify={this.addNotification} />
        </Navbar>
        <NotificationStack
          notifications={this.state.notifications.toArray()}
          dismissAfter={5000}
          onDismiss={(notification) => this.setState({
            notifications: this.state.notifications.delete(notification)
          })}
        />
        <ChromeInstall description={description} title='Unlock Now' install={this.inlineInstall} isLogin={this.props.store.isLogin} isInstall={this.props.store.isInstall} />
        <Footer brandName={brandName}
          facebookUrl='http://www.facebook.com'
          twitterUrl='http://www.twitter.com/'
          address={businessAddress}
        />
      </Page>
    )
  }
}

Home.propTypes = {
  history: PropTypes.object,
  home: PropTypes.object,
  loading: PropTypes.bool,
  isClosePopup: PropTypes.bool,
  notifications: PropTypes.object,
  changeNotifications: PropTypes.func,
  inlineInstall: PropTypes.func,
  onChangeTerm: PropTypes.func,
  onChangeFriendStream: PropTypes.func
}

export default Home
