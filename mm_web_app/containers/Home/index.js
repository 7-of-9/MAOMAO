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
import NoSSR from 'react-no-ssr'
import { NotificationStack } from 'react-notification'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import _ from 'lodash'
import { Footer, Navbar, NavItem, Page } from 'neal-react'
import NProgress from 'nprogress'
import { FACEBOOK_APP_ID, MAOMAO_SITE_URL } from '../../containers/App/constants'
import AppHeader from '../../containers/AppHeader'
import ChromeInstall from '../../containers/ChromeInstall'
import Loading from '../../components/Loading'
import Header from '../../components/Header'
import LogoIcon from '../../components/LogoIcon'
import Slogan from '../../components/Slogan'
import YourStreams from '../../components/YourStreams'
import ShareWithFriends from '../../components/ShareWithFriends'
import FriendStreams from '../../components/FriendStreams'
import StreamList from '../../components/StreamList'
import logger from '../../utils/logger'

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
          this.props.store.currentTermId = -1
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
    this.props.store.checkEnvironment()
    if (this.props.isClosePopup) {
      window.close()
    }
    if (this.props.store.shareInfo) {
      // default tab is friends stream
      this.setState({
        currentTab: 1
      })
    }
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
    let selectedMyStreamUrls = []
    let sortedTopicByUrls = []
    let friends = []
    let currentTermId = this.props.store.currentTermId
    let shareWiths = []
    if (this.props.store.userHistory) {
      const { urls, topics, accept_shares } = toJS(this.props.store.myStream)
      friends = toJS(this.props.store.friendsStream)
      sortedTopicByUrls = _.reverse(_.sortBy(_.filter(topics, (topic) => topic && topic.term_id > 0), [(topic) => topic.url_ids.length]))
      let urlIds = []
      // first for my stream
      if (currentTermId === -1 && sortedTopicByUrls.length > 0) {
        urlIds = sortedTopicByUrls[0].url_ids
        currentTermId = sortedTopicByUrls[0].term_id
      } else {
        const currentTopic = sortedTopicByUrls.find((item) => item.term_id === currentTermId)
        if (currentTopic) {
          urlIds = currentTopic.url_ids
        }
      }

      /* eslint-disable camelcase */
      if (accept_shares) {
        shareWiths = accept_shares.filter(item => item.topic_id === currentTermId)
      }

      selectedMyStreamUrls = _.filter(urls, (item) => item.id && urlIds.indexOf(item.id) !== -1)
    }

    return (
      <Page style={{ display: this.props.isClosePopup ? 'none' : '' }}>
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
        { this.props.store.isLogin &&
          <div className='wrap-main'>
            <Tabs onSelect={this.handleSelect} selectedIndex={this.state.currentTab}>
              <TabList className='slidebar-nav'>
                <Tab>
                  <span className='stream-symbol'><i className='fa fa-users' aria-hidden='true' /></span>
                  Your Streams
                </Tab>
                <Tab>
                  <span className='stream-symbol'><i className='fa fa-slideshare' aria-hidden='true' /></span>
                  Friend Streams
                </Tab>
              </TabList>
              <TabPanel className='main-content'>
                {!this.props.store.shareInfo &&
                  <NoSSR onSSR={<Loading isLoading />}>
                    <ChromeInstall
                      description={description}
                      title='Unlock YOUR FRIEND STREAM Now'
                      install={this.inlineInstall}
                    />
                  </NoSSR>
                }
                <YourStreams
                  topics={sortedTopicByUrls}
                  activeId={currentTermId}
                  changeTerm={(termId) => { this.props.store.currentTermId = termId }}
              />
                <Loading isLoading={this.props.store.userHistoryResult && this.props.store.userHistoryResult.state === 'pending'} />
                {shareWiths.length > 0 && <ShareWithFriends friends={shareWiths} />}
                <StreamList urls={selectedMyStreamUrls} />
              </TabPanel>
              <TabPanel className='main-content'>
                {!!this.props.store.shareInfo &&
                <NoSSR onSSR={<Loading isLoading />}>
                  <ChromeInstall
                    description={description}
                    title='Unlock YOUR FRIEND STREAM Now'
                    install={this.inlineInstall}
                  />
                </NoSSR>
                }
                <FriendStreams friends={friends} />
                <Loading isLoading={this.props.store.userHistoryResult && this.props.store.userHistoryResult.state === 'pending'} />
              </TabPanel>
            </Tabs>
          </div>
        }
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
