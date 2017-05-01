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

Router.onRouteChangeStart = (url) => {
  NProgress.start()
}
Router.onRouteChangeComplete = () => NProgress.done()
Router.onRouteChangeError = () => NProgress.done()

const brandName = 'MaoMao'
const brand = <Header><LogoIcon /><Slogan /></Header>
const businessAddress = (
  <address>
    <strong>{brandName} </strong>
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
    })
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
    setTimeout(() => {
      if (this.props.store.shareInfo) {
        this.props.store.checkInstall()
        // search image for bg
        this.props.store.searchBgImage()
        // default tab is friends stream
        this.setState({
          currentTab: 1
        })
      }
    }, 100)
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
    let selectedMyStreamUrls = []
    let sortedTopicByUrls = []
    let friends = []
    let currentTermId = this.props.store.currentTermId
    let friendStreamId = this.props.store.friendStreamId
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
      if (friendStreamId === -1 && friends.length) {
        friendStreamId = friends[0].user_id
      }
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
        <NoSSR onSSR={<Loading isLoading />}>
          <div>
            { !this.props.store.isLogin &&
              <ChromeInstall
                description={description}
                title='Unlock Now'
                install={this.inlineInstall}
                />
            }
          </div>
        </NoSSR>
        { this.props.store.isLogin &&
          <div className='container'>
            <Tabs onSelect={this.handleSelect} selectedIndex={this.state.currentTab}>
              <TabList>
                <Tab>Your Streams</Tab>
                <Tab>Friend Streams</Tab>
              </TabList>
              <TabPanel>
                <YourStreams
                  topics={sortedTopicByUrls}
                  activeId={currentTermId}
                  changeTerm={(termId) => { this.props.store.currentTermId = termId }}
              />
                <Loading isLoading={this.props.store.userHistoryResult && this.props.store.userHistoryResult.state === 'pending'} />
                {shareWiths.length > 0 && <ShareWithFriends friends={shareWiths} />}
                <StreamList urls={selectedMyStreamUrls} />
              </TabPanel>
              <TabPanel>
                <Loading isLoading={this.props.store.userHistoryResult && this.props.store.userHistoryResult.state === 'pending'} />
                <FriendStreams friends={friends} />
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
