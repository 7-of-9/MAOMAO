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
import { toJS } from 'mobx'
import { NotificationStack } from 'react-notification'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import _ from 'lodash'
import { Footer, Navbar, NavItem, Page } from 'neal-react'
import ToggleDisplay from 'react-toggle-display'
import NProgress from 'nprogress'
import DevTools from 'mobx-react-devtools'
import { FACEBOOK_APP_ID, MAOMAO_SITE_URL } from '../../containers/App/constants'
import AppHeader from '../../containers/AppHeader'
import ChromeInstall from '../../containers/ChromeInstall'
import FriendStreams from '../../containers/FriendStreams'
import MyStreams from '../../containers/MyStreams'
import Loading from '../../components/Loading'
import Header from '../../components/Header'
import LogoIcon from '../../components/LogoIcon'
import Slogan from '../../components/Slogan'
import logger from '../../utils/logger'

Router.onRouteChangeStart = (url) => {
  NProgress.start()
}
Router.onRouteChangeComplete = () => NProgress.done()
Router.onRouteChangeError = () => NProgress.done()

const dev = process.env.NODE_ENV !== 'production'
const brandName = 'maomao'
const brand = <Header><LogoIcon /><Slogan /></Header>
const businessAddress = (
  <address>
    <img src='/static/images/maomao.png' className='logo-image' alt='maomao' />
  </address>
)

@inject('store')
@inject('ui')
@observer
class Home extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      currentTab: 0
    }
    this.onInstallSucess = this.onInstallSucess.bind(this)
    this.onInstallFail = this.onInstallFail.bind(this)
    this.inlineInstall = this.inlineInstall.bind(this)
    this.addNotification = this.addNotification.bind(this)
    this.removeNotification = this.removeNotification.bind(this)
    this.handleSelect = this.handleSelect.bind(this)
  }

  handleSelect (index, last) {
    this.setState({
      currentTab: index
    }, () => {
      const currentTermId = this.props.store.currentTermId
      if (index === 0) {
        logger.warn('currentTermId', currentTermId)
        if (currentTermId > 0) {
          // hotfix to reload data
          this.props.store.currentTermId = currentTermId
        } else {
          if (this.props.store.userHistory) {
            const { topics } = toJS(this.props.store.myStream)
            const sortedTopicByUrls = _.reverse(_.sortBy(_.filter(topics, (topic) => topic && topic.term_id > 0), [(topic) => topic.url_ids.length]))
            // first for my stream
            logger.warn('sortedTopicByUrls', sortedTopicByUrls)
            if (currentTermId === -1 && sortedTopicByUrls.length > 0) {
              this.props.store.currentTermId = sortedTopicByUrls[0].term_id
            }
          }
        }
      }
    })
  }

  onInstallSucess () {
    this.addNotification('Yeah! You have been installed maomao extension successfully.')
    setTimeout(() => {
      window.location.reload()
      this.props.store.checkEnvironment()
    }, 1000)
  }

  onInstallFail (error) {
    this.addNotification(error)
  }

  addNotification (msg) {
    this.props.ui.addNotification(msg)
  }

  inlineInstall () {
    /* global chrome */
    chrome.webstore.install(
      'https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk',
      this.onInstallSucess,
      this.onInstallFail)
  }

  removeNotification (uuid) {
    this.props.ui.removeNotification(uuid)
  }

  componentDidMount () {
    if (this.props.store.shareInfo) {
      // default tab is friends stream
      this.setState({
        currentTab: 1
      })
    }
    // re-check install MM extenion by timeout
    setTimeout(() => this.props.store.checkEnvironment(), 100)
  }

  render () {
    const title = 'maomao - peer-to-peer real time content sharing network'
    let description = 'maomao is a peer-to-peer real time content sharing network, powered by a deep learning engine.'
    if (this.props.store.shareInfo) {
      const { fullname, share_all: shareAll, topic_title: topicTitle, url_title: urlTitle } = this.props.store.shareInfo
      if (shareAll) {
        description = `${fullname} would like to share all maomao stream with you`
      } else if (urlTitle && urlTitle.length) {
        description = `${fullname} would like to share "${urlTitle}" with you`
      } else if (topicTitle && topicTitle.length) {
        description = `${fullname} would like to share the maomao stream with you: "${topicTitle}"`
      }
    }

    return (
      <Page>
        <Head>
          <meta charSet='utf-8' />
          <title>{title}</title>
          <link rel='shortcut icon' type='image/x-icon' href='/static/favicon.ico' />
          <meta name='description' content={description} />
          <meta name='og:title' content={title} />
          <meta name='og:description' content={description} />
          <meta name='og:image' content={this.props.store.bgImage && this.props.store.bgImage.length > 0 ? this.props.store.bgImage : `${MAOMAO_SITE_URL}static/images/logo.png`} />
          <meta name='fb:app_id' content={FACEBOOK_APP_ID} />
          <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no' />
          <link rel='chrome-webstore-item' href='https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk' />
          <script src='https://code.jquery.com/jquery-3.1.1.slim.min.js' />
          <script src='https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js' />
          <script src='https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js' />
          <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css' />
          <link rel='stylesheet' href='/static/vendors/css/nprogress.css' />
        </Head>
        <Navbar className='header-nav animated fadeInDown' brand={brand}>
          <NavItem><Link href='/' className='nav-link'><a href='/'>Home</a></Link></NavItem>
          <NavItem><Link prefetch href='/discovery' className='nav-link'><a href='/discovery'>Discovery</a></Link></NavItem>
          <NavItem><Link prefetch href='/hiring' className='nav-link'><a href='/hiring'>Hiring</a></Link></NavItem>
          <AppHeader notify={this.addNotification} />
        </Navbar>
        <NotificationStack
          notifications={this.props.ui.notifications.toArray()}
          dismissAfter={5000}
          onDismiss={(notification) => this.props.ui.notifications.remove(notification)}
        />
        <ToggleDisplay if={!this.props.store.isLogin}>
          <ChromeInstall
            description={description}
            title='Unlock YOUR FRIEND STREAM Now'
            install={this.inlineInstall}
          />
        </ToggleDisplay>
        <ToggleDisplay if={this.props.store.isLogin}>
          <div className='wrap-main wrap-toggle'>
            <Tabs onSelect={this.handleSelect} selectedIndex={this.state.currentTab}>
              <TabList className='slidebar-nav animated fadeInDown'>
                <Tab>
                  <div className='stream-tabs'>
                    <span className='stream-symbol' data-tooltip='Your Streams' data-position='right'>
                      <i className='fa fa-user' aria-hidden='true' />
                    </span>
                    <span className='stream-text'>Your Streams</span>
                  </div>
                </Tab>
                <Tab>
                  <div className='stream-tabs'>
                    <span className='stream-symbol' data-tooltip='Friend Streams' data-position='right'>
                      <i className='fa fa-users' aria-hidden='true' />
                    </span>
                    <span className='stream-text'>Friend Streams</span>
                  </div>
                </Tab>
              </TabList>
              <TabPanel className='main-content'>
                { !this.props.store.shareInfo && !this.props.store.isMobile &&
                <ChromeInstall
                  description={description}
                  title='Unlock YOUR FRIEND STREAM Now'
                  install={this.inlineInstall}
                  />
                }
                <MyStreams />
                <Loading isLoading={this.props.store.isProcessing} />
              </TabPanel>
              <TabPanel className='main-content'>
                {!!this.props.store.shareInfo && !this.props.store.isMobile &&
                  <ChromeInstall
                    description={description}
                    title='Unlock YOUR FRIEND STREAM Now'
                    install={this.inlineInstall}
                  />
                }
                <FriendStreams />
                <Loading isLoading={this.props.store.isProcessing} />
              </TabPanel>
            </Tabs>
          </div>
        </ToggleDisplay>
        <div className='footer-area'>
          <Footer brandName={brandName}
            facebookUrl='https://www.facebook.com/maomao.hiring'
            address={businessAddress}
          />
        </div>
        {dev && <DevTools />}
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
