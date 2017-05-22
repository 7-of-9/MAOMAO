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
import Modal from 'react-modal'
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
import { guid } from '../../utils/hash'

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

const customModalStyles = {
  content: {
    top: '72px',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    width: '600px',
    overflow: 'hidden',
    margin: '0 0 0 -300px'
  }
}

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
      // TODO: add user to filer result
    }
    // re-check install MM extenion by timeout
    setTimeout(() => {
      this.props.store.checkEnvironment()
    }, 100)
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
          <NavItem>
            <a data-toggle='dropdown'>
              <i className='fa fa-briefcase fa-2x' aria-hidden='true' />
              <span className='notifications-number notifications-hiring'>
                <i className='fa fa-bullhorn' aria-hidden='true' /> We're hiring !
              </span>
            </a>
            <ul className='dropdown-menu pull-right'>
              <li key={guid()}>
                <Link prefetch href='/hiring-js' className='nav-link'>
                  <a href='/hiring-js'>JavaScript / Node.JS Developer</a>
                </Link>
              </li>
              <li key={guid()}>
                <Link prefetch href='/hiring-vp' className='nav-link'>
                  <a href='/hiring-vp'>Server & Platform Engineer / VP Engineering</a>
                </Link>
              </li>
            </ul>
          </NavItem>
          {
              this.props.store.isLogin &&
              <NavItem>
                <a onClick={() => { this.props.ui.openShareModal() }}>
                  <i className='fa fa-share-alt fa-2x' aria-hidden='true' />
                </a>
                <Modal
                  isOpen={this.props.ui.showShareModal}
                  onRequestClose={() => this.props.ui.closeShareModal()}
                  portalClassName='ShareModal'
                  style={customModalStyles}
                  contentLabel='Manage sharing'>
                  <div className='share-modal-content'>
                    <div className='modal-header'>
                      <h4 className='modal-title'>List share topic</h4>
                    </div>
                    <div className='modal-body'>
                      <ul className='list-topics'>
                        <li className='items-topics'>
                          <div className='directional-user'>
                            <div className='share-image'>
                              <a href='#'><img className='share-object' src='https://lh6.googleusercontent.com/-WLGCOsPN58Q/AAAAAAAAAAI/AAAAAAAAABc/pJzt8KW6Pxg/photo.jpg' alt='' width='30' height='30' /></a>
                            </div>
                            <div className='share-line' />
                            <div className='share-image'>
                              <a href='#'><img className='share-object' src='https://lh4.googleusercontent.com/-ZkXKKEWALHg/AAAAAAAAAAI/AAAAAAAAATI/3U8fKfpcXqs/photo.jpg' alt='' width='30' height='30' /></a>
                            </div>
                          </div>
                          <div className='media media-share'>
                            <div className='media-left'>
                              <a href=''>
                                <img className='media-object' src='https://avatars0.githubusercontent.com/u/6412038?v=3&s=400' alt='' width='40' height='40' />
                              </a>
                            </div>
                            <div className='media-body'>
                              <div className='media-body-inner'>
                                <h4 className='media-heading'>
                                  <span className='text-ellipsis'>reactjs/react-modal: Accessible modal dialog component for React (7839)</span>
                                </h4>
                                <div className='share-with'>
                                  <div className='tags-topic'>
                                    <span className='tags tags-color-4' rel='tag'>
                                      <span class='text-tag'>JavaScript</span>
                                      <a className='btn-box-remove' title='Unshare'><i className='fa fa-share' aria-hidden='true' /></a>
                                    </span>
                                    <span className='tags tags-color-1' rel='tag'>
                                      <span class='text-tag'>Television</span>
                                      <a className='btn-box-remove' title='Unshare'><i className='fa fa-share' aria-hidden='true' /></a>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                        <li className='items-topics'>
                          <div className='directional-user'>
                            <div className='share-image'>
                              <a href='#'><img className='share-object' src='https://lh6.googleusercontent.com/-WLGCOsPN58Q/AAAAAAAAAAI/AAAAAAAAABc/pJzt8KW6Pxg/photo.jpg' alt='' width='30' height='30' /></a>
                            </div>
                            <div className='share-line share-line-left' />
                            <div className='share-image'>
                              <a href='#'><img className='share-object' src='https://scontent.xx.fbcdn.net/v/t1.0-1/s100x100/14702240_10207386391686714_2875182266540735639_n.jpg?oh=3fe0b8f61f0774ca75120127cd640154&oe=5957A4E8' alt='' width='30' height='30' /></a>
                            </div>
                          </div>
                          <div className='media media-share'>
                            <div className='media-left'>
                              <a href=''>
                                <img className='media-object' src='http://cdn.tutorialzine.com/wp-content/uploads/2017/05/js-animations.png' alt='' width='40' height='40' />
                              </a>
                            </div>
                            <div className='media-body'>
                              <div className='media-body-inner'>
                                <h4 className='media-heading'>
                                  <span className='text-ellipsis'>20 Tips For Writing Modern CSS | Tutorialzine (16125)</span>
                                </h4>
                                <div className='share-with'>
                                  <div className='tags-topic'>
                                    <span className='tags tags-color-1' rel='tag'>
                                      <span className='text-tag'>Television</span>
                                      <a className='btn-box-remove' title='Unshare'><i className='fa fa-share' aria-hidden='true' /></a>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                        <li className='items-topics'>
                          <div className='directional-user'>
                            <div className='share-image'>
                              <a href='#'><img className='share-object' src='https://lh6.googleusercontent.com/-WLGCOsPN58Q/AAAAAAAAAAI/AAAAAAAAABc/pJzt8KW6Pxg/photo.jpg' alt='' width='30' height='30' /></a>
                            </div>
                            <div className='share-line share-line-right' />
                            <div className='share-image'>
                              <a href='#'><img className='share-object' src='/static/images/no-image.png' alt='' width='30' height='30' /></a>
                            </div>
                          </div>
                          <div className='media media-share'>
                            <div className='media-left'>
                              <a href=''>
                                <img className='media-object' src='https://avatars2.githubusercontent.com/u/1335026?v=3&s=400' alt='' width='40' height='40' />
                              </a>
                            </div>
                            <div className='media-body'>
                              <div className='media-body-inner'>
                                <h4 className='media-heading'>
                                  <span className='text-ellipsis'>Buttons - Material Components for the Web (16119)</span>
                                </h4>
                                <div className='share-with'>
                                  <div className='tags-topic'>
                                    <span className='tags tags-color-2' rel='tag'>
                                      <span className='text-tag'>YouTube - Broadcast yourself</span>
                                      <a className='btn-box-remove' title='Unshare'><i className='fa fa-share' aria-hidden='true' /></a>
                                    </span>
                                    <span className='tags tags-color-12' rel='tag'>
                                      <span className='text-tag'>Technology</span>
                                      <a className='btn-box-remove' title='Unshare'><i className='fa fa-share' aria-hidden='true' /></a>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                        <li className='items-topics'>
                          <div className='directional-user'>
                            <div className='share-image'>
                              <a href='#'><img className='share-object' src='https://lh6.googleusercontent.com/-WLGCOsPN58Q/AAAAAAAAAAI/AAAAAAAAABc/pJzt8KW6Pxg/photo.jpg' alt='' width='30' height='30' /></a>
                            </div>
                            <div className='share-line share-line-left share-line-right' />
                            <div className='share-image'>
                              <a href='#'><img className='share-object' src='/static/images/no-image.png' alt='' width='30' height='30' /></a>
                            </div>
                          </div>
                          <div className='media media-share'>
                            <div className='media-left'>
                              <a href=''>
                                <img className='media-object' src='https://cdn-images-1.medium.com/max/1200/1*MXL-j6S8fTEd8UFP_foEEw.png' alt='' width='40' height='40' />
                              </a>
                            </div>
                            <div className='media-body'>
                              <div className='media-body-inner'>
                                <h4 className='media-heading'>
                                  <span className='text-ellipsis'>Floating Action Buttons - Material Components for the Web (16121)</span>
                                </h4>
                                <div className='share-with'>
                                  <div className='tags-topic'>
                                    <span className='tags tags-color-7' rel='tag'>
                                      <span className='text-tag'>University of California, Berkeley</span>
                                      <a className='btn-box-remove' title='Unfollow'><i className='fa fa-user-times' aria-hidden='true' /></a>
                                    </span>
                                    <span className='tags tags-color-6' rel='tag'>
                                      <span className='text-tag'>blog.codeship.com/</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Modal>
              </NavItem>
          }
          {
              this.props.store.isLogin &&
              <NavItem>
                <a data-toggle='dropdown'>
                  <i className='fa fa-list fa-2x' aria-hidden='true' />
                </a>
                <ul className='dropdown-menu dropdown-modifier stream-list pull-right'>
                  {topics.map(topic => (
                    <li key={guid()}><span className='topic-name'><i className='fa fa-angle-right' aria-hidden='true' /> {topic.name}</span></li>
                  ))}
                </ul>
              </NavItem>
          }
          {
              this.props.store.isLogin &&
              <NavItem>
                <a data-toggle='dropdown'>
                  <i className='fa fa-users fa-2x' aria-hidden='true' />
                </a>
                <ul className='dropdown-menu dropdown-modifier  pull-right'>
                  {users.map(user =>
                    (<li key={guid()}>
                      <div className='user-share'>
                        <div className='user-share-img'>
                          <img width='24' height='24' src={user.avatar || '/static/images/no-avatar.png'} alt='' />
                        </div>
                        <div className='user-share-cnt'>
                          <div className='user-share-inner'>
                            <p className='user-info'>
                              <span className='share-fullname'>{user.fullname}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </NavItem>
          }
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
