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
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { NotificationStack } from 'react-notification'
import { Footer, Navbar, NavItem, Page } from 'neal-react'
import ToggleDisplay from 'react-toggle-display'
import NProgress from 'nprogress'
import { FACEBOOK_APP_ID, MAOMAO_SITE_URL } from '../../containers/App/constants'
import AppHeader from '../../containers/AppHeader'
import Streams from '../../containers/Streams'
import ChromeInstall from '../../containers/ChromeInstall'
import Loading from '../../components/Loading'
import Header from '../../components/Header'
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
  </address>
)

@inject('store')
@inject('ui')
@observer
class Home extends React.Component {
  constructor (props) {
    super(props)
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
      // TODO: ad user to filer result
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

    const { users, topics } = toJS(this.props.store)

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
          <NavItem><Link prefetch href='/hiring' className='nav-link'><a href='/hiring'><i className='fa fa-briefcase fa-2x' aria-hidden='true' /></a></Link></NavItem>
          <NavItem>
            <a href='javascript:void(0)' data-toggle='dropdown'><i className='fa fa-list fa-2x' aria-hidden='true' /> <span className='notifications-number notifications-topic'>{topics.length}</span></a>
            <ul className='dropdown-menu dropdown-modifier pull-right'>
              <li>
                <div className='user-share'>
                  <div className='user-share-img'>
                    <img width='30' height='30' src='https://scontent.xx.fbcdn.net/v/t1.0-1/s100x100/1098332_526239880830644_611792346_n.jpg?oh=a8613e2896f4ad275da640f36bc72ac1&oe=599AC622' alt='' />
                  </div>
                  <div className='user-share-cnt'>
                    <div className='user-share-inner'>
                      <p className='user-info'>
                        <span className='share-fullname'>Dang Cong Dao</span> has unlocked 
                        <span className='share-code'> 094JJGG</span>
                      </p>
                    </div>
                    <a className='btn-unshare' href='#'><i className='fa fa-share-alt' aria-hidden='true' /> UnShare</a>
                  </div>
                </div>
              </li>
              <li>
                <div className='user-share'>
                  <div className='user-share-img'>
                    <img width='30' height='30' src='https://lh6.googleusercontent.com/-WLGCOsPN58Q/AAAAAAAAAAI/AAAAAAAAABc/pJzt8KW6Pxg/photo.jpg' alt='' />
                  </div>
                  <div className='user-share-cnt'>
                    <div className='user-share-inner'>
                      <p className='user-info'>
                        <span className='share-fullname'>Đức Dũng Huỳnh</span> has unlocked 
                        <span className='share-code'> 094JJGG</span>
                      </p>
                    </div>
                    <a className='btn-unshare' href='#'><i className='fa fa-share-alt' aria-hidden='true' /> UnShare</a>
                  </div>
                </div>
              </li>
            </ul>
          </NavItem>
          <NavItem>
            <a href='javascript:void(0)' data-toggle='dropdown'><i className='fa fa-users fa-2x' aria-hidden='true' /> <span className='notifications-number notifications-topic'>{users.length}</span></a>
            <ul className='dropdown-menu dropdown-modifier  pull-right'>
              <li>
                <div className='user-share'>
                  <div className='user-share-img'>
                    <img width='24' height='24' src='/static/images/no-avatar.png' alt='' />
                  </div>
                  <div className='user-share-cnt'>
                    <div className='user-share-inner'>
                      <p className='user-info'>
                      <span className='share-fullname'>Jack Son</span> (7 invitations)</p>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className='user-share'>
                  <div className='user-share-img'>
                    <img width='24' height='24' src='https://scontent.xx.fbcdn.net/v/t1.0-1/s100x100/14702240_10207386391686714_2875182266540735639_n.jpg?oh=3fe0b8f61f0774ca75120127cd640154&oe=5957A4E8' alt='' />
                  </div>
                  <div className='user-share-cnt'>
                    <div className='user-share-inner'>
                      <p className='user-info'>
                        <span className='share-fullname'>Dominic Morris</span> (7 invitations)
                      </p>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className='user-share'>
                  <div className='user-share-img'>
                    <img width='24' height='24' src='https://lh6.googleusercontent.com/-WLGCOsPN58Q/AAAAAAAAAAI/AAAAAAAAABc/pJzt8KW6Pxg/photo.jpg' alt='' />
                  </div>
                  <div className='user-share-cnt'>
                    <div className='user-share-inner'>
                      <p className='user-info'>
                        <span className='share-fullname'>Đức Dũng Huỳnh</span> (7 invitations)
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </NavItem>
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
          { !this.props.store.isMobile &&
            <ChromeInstall
              description={description}
              title='Unlock YOUR FRIEND STREAM Now'
              install={this.inlineInstall}
            />
            }
          <Streams />
          <Loading isLoading={this.props.store.isProcessing} />
        </ToggleDisplay>
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
