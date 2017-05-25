/*
 *
 * Home
 *
 */

import React from 'react'
import PropTypes from 'prop-types'
import { compose, withHandlers, lifecycle, pure } from 'recompose'
import Head from 'next/head'
import Router from 'next/router'
import Link from 'next/link'
import { toJS } from 'mobx'
import { NotificationStack } from 'react-notification'
import Modal from 'react-modal'
import { Footer, Navbar, NavItem, Page } from 'neal-react'
import ToggleDisplay from 'react-toggle-display'
import NProgress from 'nprogress'
import NoSSR from 'react-no-ssr'
import { FACEBOOK_APP_ID, MAOMAO_SITE_URL } from '../../containers/App/constants'
import AppHeader from '../AppHeader'
import Streams from '../Streams'
import ChromeInstall from '../ChromeInstall'
import Loading from '../../components/Loading'
import Header from '../../components/Header'
import LogoIcon from '../../components/LogoIcon'
import Slogan from '../../components/Slogan'
import { guid } from '../../utils/hash'
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
  </address>
)

const customModalStyles = {
  content: {
    top: '82px',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
    overflow: 'hidden'
  }
}

const enhance = compose(
  withHandlers({
    onInstallSucess: props => () => {
      props.addNotification('Yeah! You have been installed maomao extension successfully.')
      setTimeout(() => {
        window.location.reload()
        props.store.checkEnvironment()
      }, 1000)
    },
    onInstallFail: props => (error) => {
      props.addNotification(error)
    },
    addNotification: props => (msg) => {
      props.ui.addNotification(msg)
    },
    inlineInstall: props => () => {
      /* eslint-disable */
      chrome.webstore.install(
      'https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk',
      props.onInstallSucess,
      props.onInstallFail)
      /* eslint-enable */
    },
    removeNotification: props => (uuid) => {
      props.ui.removeNotification(uuid)
    }
  }),
  lifecycle({
    componentDidMount () {
      // TODO: filter by invite user
      logger.warn('Home componentDidMount')
    }
  }),
  pure
)

const Home = enhance(({
  store, ui,
  addNotification, removeNotification, inlineInstall
}) => {
  const title = 'maomao - peer-to-peer real time content sharing network'
  let description = 'maomao is a peer-to-peer real time content sharing network, powered by a deep learning engine.'
  if (store.shareInfo) {
    const { fullname, share_all: shareAll, topic_title: topicTitle, url_title: urlTitle } = store.shareInfo
    if (shareAll) {
      description = `${fullname} would like to share all maomao stream with you`
    } else if (urlTitle && urlTitle.length) {
      description = `${fullname} would like to share "${urlTitle}" with you`
    } else if (topicTitle && topicTitle.length) {
      description = `${fullname} would like to share the maomao stream with you: "${topicTitle}"`
    }
  }

  const { users, topics } = toJS(store)

  return (
    <Page>
      <Head>
        <meta charSet='utf-8' />
        <title>{title}</title>
        <link rel='shortcut icon' type='image/x-icon' href='/static/favicon.ico' />
        <meta name='description' content={description} />
        <meta name='og:title' content={title} />
        <meta name='og:description' content={description} />
        <meta name='og:image' content={store.bgImage && store.bgImage.length > 0 ? store.bgImage : `${MAOMAO_SITE_URL}static/images/logo.png`} />
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
            <i className='fa fa-chevron-circle-down' aria-hidden='true' />
          </a>
          <ul className='dropdown-menu dropdown-hiring pull-right'>
            <li key={guid()}>
              <Link prefetch href='/hiring-js' className='nav-link'>
                <a href='/hiring-js'><i className='fa fa-angle-right' aria-hidden='true' />  JavaScript / Node.JS Developer</a>
              </Link>
            </li>
            <li key={guid()}>
              <Link prefetch href='/hiring-vp' className='nav-link'>
                <a href='/hiring-vp'><i className='fa fa-angle-right' aria-hidden='true' />  Server & Platform Engineer / VP Engineering</a>
              </Link>
            </li>
          </ul>
        </NavItem>
        {
              store.isLogin &&
              <NavItem>
                <a onClick={() => { ui.openShareModal() }}>
                  <i className='fa fa-share-alt fa-2x' aria-hidden='true' />
                  <span className='nav-text'>Share</span>
                </a>
                <Modal
                  isOpen={ui.showShareModal}
                  onRequestClose={() => ui.closeShareModal()}
                  portalClassName='ShareModal'
                  style={customModalStyles}
                  contentLabel='Manage sharing'>
                  <div className='share-modal-content'>
                    <div className='modal-header'>
                      <h4 className='modal-title'>List share topic</h4>
                    </div>
                    <div className='modal-body'>
                      <div id='accordion' role='tablist' aria-multiselectable='true'>
                        <div className='card card-topic'>
                          <div className='card-header' role='tab' id='headingOne' data-toggle='collapse' data-parent='#accordion' href='#collapseOne' aria-expanded='true' aria-controls='collapseOne'>
                            <div className='directional-user'>
                              <div className='share-image'>
                                <a href='#'><img className='share-object' src='https://lh6.googleusercontent.com/-WLGCOsPN58Q/AAAAAAAAAAI/AAAAAAAAABc/pJzt8KW6Pxg/photo.jpg' alt='' width='40' height='40' /></a>
                              </div>
                              <div className='share-name'> Huỳnh Đức Dũng</div>
                            </div>
                          </div>
                          <div id='collapseOne' className='collapse show' role='tabpanel' aria-labelledby='headingOne'>
                            <div className='card-block'>
                              <ul className='timeline timeline-horizontal'>
                                <li className='timeline-item'>
                                  <div className='timeline-badge'>
                                    <a href='#'>
                                      <img className='object-badge' src='https://lh6.googleusercontent.com/-WLGCOsPN58Q/AAAAAAAAAAI/AAAAAAAAABc/pJzt8KW6Pxg/photo.jpg' alt='' width='51' height='51' />
                                    </a>
                                  </div>
                                  <div className='timeline-panel'>
                                    <a href='#' className='btn btn-related'>Unshare</a>
                                  </div>
                                </li>
                                <li className='timeline-item'>
                                  <div className='timeline-badge'>
                                    <i className='fa fa-share-alt' aria-hidden='true' />
                                  </div>
                                  <div className='timeline-panel'>
                                    <span className='name-url'>github.com</span>
                                  </div>
                                </li>
                                <li className='timeline-item share-line-left'>
                                  <div className='timeline-badge'>
                                    <a href='#'>
                                      <img className='object-badge' src='https://lh4.googleusercontent.com/-ZkXKKEWALHg/AAAAAAAAAAI/AAAAAAAAATI/3U8fKfpcXqs/photo.jpg' alt='' width='51' height='51' />
                                    </a>
                                  </div>
                                  <div className='timeline-panel'>
                                    <a href='#' className='btn btn-unfollow'>Unfollow</a>
                                  </div>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className='card card-topic'>
                          <div className='card-header' role='tab' id='headingOne' data-toggle='collapse' data-parent='#accordion' href='#collapseOne' aria-expanded='true' aria-controls='collapseOne'>
                            <div className='directional-user'>
                              <div className='share-image'>
                                <a href='#'><img className='share-object' src='https://scontent.xx.fbcdn.net/v/t1.0-1/s100x100/14702240_10207386391686714_2875182266540735639_n.jpg?oh=3fe0b8f61f0774ca75120127cd640154&oe=5957A4E8' alt='' width='40' height='40' /></a>
                              </div>
                              <div className='share-name'> Dominic Morris</div>
                            </div>
                          </div>
                          <div id='collapseTwo' className='collapse show' role='tabpanel' aria-labelledby='headingTwo'>
                            <div className='card-block'>
                              <ul className='timeline timeline-horizontal'>
                                <li className='timeline-item share-line-right'>
                                  <div className='timeline-badge'>
                                    <a href='#'>
                                      <img className='object-badge' src='https://scontent.xx.fbcdn.net/v/t1.0-1/s100x100/14702240_10207386391686714_2875182266540735639_n.jpg?oh=3fe0b8f61f0774ca75120127cd640154&oe=5957A4E8' alt='' width='51' height='51' />
                                    </a>
                                  </div>
                                  <div className='timeline-panel'>
                                    <a href='#' className='btn btn-related'>Unshare</a>
                                  </div>
                                </li>
                                <li className='timeline-item'>
                                  <div className='timeline-badge'>
                                    <i className='fa fa-list' aria-hidden='true' />
                                  </div>
                                  <div className='timeline-panel'>
                                    <div className='tags-topic'>
                                      <span className='tags tags-color-7' rel='tag'>
                                        <span className='text-tag'>University of California, Berkeley</span>
                                      </span>
                                    </div>
                                  </div>
                                </li>
                                <li className='timeline-item'>
                                  <div className='timeline-badge'>
                                    <a href='#'>
                                      <img className='object-badge' src='https://lh6.googleusercontent.com/-WLGCOsPN58Q/AAAAAAAAAAI/AAAAAAAAABc/pJzt8KW6Pxg/photo.jpg' alt='' width='51' height='51' />
                                    </a>
                                  </div>
                                  <div className='timeline-panel'>
                                    <a href='#' className='btn btn-unfollow'>Unfollow</a>
                                  </div>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Modal>
              </NavItem>
          }
        {
              store.isLogin &&
              <NavItem>
                <a data-toggle='dropdown'>
                  <i className='fa fa-list fa-2x' aria-hidden='true' />
                  <span className='nav-text'>List Topic</span>
                  <i className='fa fa-chevron-circle-down' aria-hidden='true' />
                </a>
                <ul className='dropdown-menu dropdown-modifier stream-list pull-right'>
                  {topics.map(topic => (
                    <li key={guid()}><span className='topic-name'><i className='fa fa-angle-right' aria-hidden='true' /> {topic.name}</span></li>
                  ))}
                </ul>
              </NavItem>
          }
        {
              store.isLogin &&
              <NavItem>
                <a data-toggle='dropdown'>
                  <i className='fa fa-users fa-2x' aria-hidden='true' />
                  <span className='nav-text'>Friend Streams</span>
                  <i className='fa fa-chevron-circle-down' aria-hidden='true' />
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
        <AppHeader ui={ui} store={store} notify={addNotification} />
      </Navbar>
      <NotificationStack
        notifications={ui.notifications.toArray()}
        dismissAfter={5000}
        onDismiss={(notification) => ui.notifications.remove(notification)}
        />
      <ToggleDisplay if={!store.isLogin}>
        <NoSSR>
          <ChromeInstall
            description={description}
            title='Unlock YOUR FRIEND STREAM Now'
            install={inlineInstall}
           />
        </NoSSR>
      </ToggleDisplay>
      <ToggleDisplay if={store.isLogin}>
        { !store.isMobile &&
        <NoSSR>
          <ChromeInstall
            description={description}
            title='Unlock YOUR FRIEND STREAM Now'
            install={inlineInstall}
              />
        </NoSSR>
        }
        <Streams />
        <Loading isLoading={store.isProcessing} />
      </ToggleDisplay>
      <div className='footer-area'>
        <Footer brandName={brandName}
          facebookUrl='https://www.facebook.com/maomao.hiring'
          address={businessAddress}
          />
      </div>
    </Page>
  )
})

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
