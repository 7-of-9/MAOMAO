/*
 *
 * AppHeader
 *
 */

import React from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'
import Router from 'next/router'
import { inject, observer } from 'mobx-react'
import firebase from 'firebase'
import 'isomorphic-fetch'
import _ from 'lodash'
import Modal from 'react-modal'
import { Navbar, NavItem } from 'neal-react'
import Header from '../../components/Header'
import LogoIcon from '../../components/LogoIcon'
import Slogan from '../../components/Slogan'
import { guid } from '../../utils/hash'
import { clientCredentials } from '../../firebaseCredentials'
import logger from '../../utils/logger'

const brand = (user) => (
  <Header>
    <LogoIcon />
    <Slogan redirectUrl={user && user.nav_id} />
  </Header>)

const avatar = (user) => {
  if (user && (user.picture || user.avatar)) {
    return user.picture || user.avatar
  }
  return '/static/images/no-avatar.png'
}

const customModalStyles = {
  content: {
    top: '82px',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
    overflow: 'hidden'
  }
}

@inject('store')
@inject('ui')
@observer
class AppHeader extends React.Component {
  static propTypes = {
    isHome: PropTypes.bool
  }

  static defaultProps = {
    isHome: true
  }

  onInternalLogin = () => {
    logger.info('onInternalLogin', this.props)
    this.addNotification('Test Internal: New User')
    this.props.ui.redirectToSpecialUrl(true)
    this.props.ui.toggleSignIn(false)
    this.props.store.internalLogin((user) => {
      logger.warn('test user', user)
      const { selectedTopics } = this.props.ui
      this.props.store.saveTopics(_.map(selectedTopics, item => item.termId))
      this.saveProfileUrl({ url: `/${user.nav_id}`, ...user })
      const { email, name: displayName } = user
      firebase.auth().createUserWithEmailAndPassword(email, 'maomao').then((newUser) => {
        newUser.updateProfile({
          displayName,
          photoURL: JSON.stringify(user)
        }).catch((error) => {
          this.addNotification(error.message)
        })
      }).catch((error) => {
        this.addNotification(error.message)
      })
    })
  }

  onFacebookLogin = (evt) => {
    evt.preventDefault()
    logger.info('onFacebookLogin', this.props, evt)
    this.props.ui.redirectToSpecialUrl(true)
    const provider = new firebase.auth.FacebookAuthProvider()
    provider.addScope('email')
    firebase.auth().signInWithPopup(provider).catch((error) => {
      this.addNotification(error.message)
    })
  }

  onGoogleLogin = (evt) => {
    evt.preventDefault()
    logger.info('onGoogleLogin', this.props, evt)
    this.props.ui.redirectToSpecialUrl(true)
    const provider = new firebase.auth.GoogleAuthProvider()
    provider.addScope('https://www.googleapis.com/auth/plus.me')
    provider.addScope('https://www.googleapis.com/auth/userinfo.email')
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly')
    firebase.auth().signInWithPopup(provider).catch((error) => {
      this.addNotification(error.message)
    })
  }

  isOldHomePage = () => {
    /* global URL */
    const { pathname } = new URL(window.location.href)
    return pathname === '/old'
  }

  onLogout = (evt) => {
    evt.preventDefault()
    logger.info('onLogout', this.props)
    firebase.auth().signOut().then(() => {
      fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin'
      }).then(() => {
        this.props.store.logoutUser()
      })
      this.addNotification('You have successfully signed out.')
      this.props.ui.clean()
      window.location.href = '/' // go to home page
    }).catch((error) => {
      logger.info(error)
    })
  }

  onClose = () => {
    logger.info('onClose', this.props)
    this.props.ui.toggleSignIn(false)
  }

  showSignIn = (evt) => {
    evt.preventDefault()
    this.props.ui.toggleSignIn(true, 'Sign In')
  }

  showSignUp = (evt) => {
    evt.preventDefault()
    this.props.ui.toggleSignIn(true, 'Sign Up')
  }

  openShareManagement = (evt) => {
    evt.preventDefault()
    this.props.ui.displayShareManagement()
  }

  onOpenExtensionModal = (evt) => {
    evt.preventDefault()
    this.props.ui.openExtensionModal()
  }

  onCloseExtensionModal = (evt) => {
    evt.preventDefault()
    this.props.ui.closeExtensionModal()
  }

  noImage = (evt) => {
    evt.target.src = '/static/images/no-image.png'
  }

  inlineInstall = () => {
    /* eslint-disable */
    chrome.webstore.install(
    'https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk',
    this.onInstallSucess,
    this.onInstallFail)
    /* eslint-enable */
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

  removeNotification = (uuid) => {
    this.props.ui.removeNotification(uuid)
  }

  saveProfileUrl = (user) => {
    logger.warn('saveProfileUrl', user)
    /* global URL */
    const { url } = user
    const { pathname } = new URL(window.location.href)
    logger.info('pathname', pathname)
    if (pathname !== encodeURI(url)) {
      fetch('/api/auth/profile', {
        method: 'POST',
        // eslint-disable-next-line no-undef
        headers: new Headers({ 'Content-Type': 'application/json' }),
        credentials: 'same-origin',
        body: JSON.stringify(user)
      }).then(() => {
        if (this.props.ui.isRedirectToUrl) {
          Router.push({ pathname: '/', query: { profileUrl: url } }, url, { shallow: true })
          this.props.ui.redirectToSpecialUrl(false)
        }
      })
    }
  }

  /* global fetch */
  componentDidMount () {
    logger.info('AppHeader componentDidMount', this.props.store)
    if (firebase.apps.length === 0) {
      firebase.initializeApp(clientCredentials)
      firebase.auth().onAuthStateChanged(user => {
        logger.info('firebase - onAuthStateChanged', user)
        if (user) {
          logger.info('firebase - user', user)
          const { photoURL } = user
          return user.getIdToken()
          .then((token) => {
            if (this.props.store.userId < 0) {
              if (!user.isAnonymous) {
                this.addNotification(`Welcome, ${user.displayName}!`)
              }
              this.props.ui.toggleSignIn(false)
              return fetch('/api/auth/login', {
                method: 'POST',
                // eslint-disable-next-line no-undef
                headers: new Headers({ 'Content-Type': 'application/json' }),
                credentials: 'same-origin',
                body: JSON.stringify({ token })
              }).then((res) => {
              // register for new user
                res.json().then(json => {
                  // register new user
                  logger.info('logged-in user', json)
                  if (!user.isAnonymous) {
                    const { decodedToken: { email, name, picture, firebase: { sign_in_provider, identities } } } = json
                  /* eslint-disable camelcase */
                    logger.info('sign_in_provider', sign_in_provider)
                    logger.info('identities', identities)
                    let fb_user_id = identities['facebook.com'] && identities['facebook.com'][0]
                    let google_user_id = identities['google.com'] && identities['google.com'][0]
                    let user_email = identities['email'] && identities['email'][0]
                    if (sign_in_provider === 'google.com') {
                      if (!email) {
                        _.forEach(user.providerData, item => {
                          if (item.providerId === sign_in_provider) {
                            this.props.store.googleConnect({
                              email: item.email, name, picture, google_user_id
                            }, (currentUser) => {
                              logger.info('currentUser', currentUser)
                              const { selectedTopics } = this.props.ui
                              this.props.store.saveTopics(_.map(selectedTopics, item => item.termId))
                              this.saveProfileUrl({ url: `/${currentUser.nav_id}`, ...currentUser })
                            })
                          }
                        })
                      } else {
                        this.props.store.googleConnect({
                          email, name, picture, google_user_id
                        }, (currentUser) => {
                          logger.info('currentUser', currentUser)
                          const { selectedTopics } = this.props.ui
                          this.props.store.saveTopics(_.map(selectedTopics, item => item.termId))
                          this.saveProfileUrl({ url: `/${currentUser.nav_id}`, ...currentUser })
                        })
                      }
                    } else if (sign_in_provider === 'facebook.com') {
                      if (!email) {
                        _.forEach(user.providerData, item => {
                          if (item.providerId === sign_in_provider) {
                            this.props.store.facebookConnect({
                              email: item.email, name, picture, fb_user_id
                            }, (currentUser) => {
                              logger.info('currentUser', currentUser)
                              const { selectedTopics } = this.props.ui
                              this.props.store.saveTopics(_.map(selectedTopics, item => item.termId))
                              this.saveProfileUrl({ url: `/${currentUser.nav_id}`, ...currentUser })
                            })
                          }
                        })
                      } else {
                        this.props.store.facebookConnect({
                          email, name, picture, fb_user_id
                        }, (currentUser) => {
                          logger.info('currentUser', currentUser)
                          const { selectedTopics } = this.props.ui
                          this.props.store.saveTopics(_.map(selectedTopics, item => item.termId))
                          this.saveProfileUrl({ url: `/${currentUser.nav_id}`, ...currentUser })
                        })
                      }
                    } else if (sign_in_provider === 'password') {
                      logger.info('found user email', user_email)
                      logger.info('photoURL', photoURL)
                      // hack here, try to store intenal user
                      try {
                        const loggedUser = JSON.parse(photoURL)
                        // TODO: need to get nav_id for internal user
                        this.props.store.retrylLoginForInternalUser(loggedUser, (currentUser) => {
                          logger.info('currentUser', currentUser)
                          const { selectedTopics } = this.props.ui
                          this.props.store.saveTopics(_.map(selectedTopics, item => item.termId))
                          this.saveProfileUrl({ url: `/${currentUser.nav_id}`, ...currentUser })
                        })
                      } catch (error) {
                        logger.warn(error)
                      }
                    }
                  } else {
                    this.props.store.isLogin = true
                  }
                })
              })
            } else {
              this.props.store.isLogin = true
            }
          })
        }
      })
    }

    this.props.store.checkInstall()
    let counter = 0
    this.timer = setInterval(() => {
      logger.info('AppHeader componentDidMount setInterval')
      counter += 1
      if (this.props.store.isChrome && !this.props.store.isMobile && counter < 10) {
        this.props.store.checkInstall()
        if (this.props.store.isInstalledOnChromeDesktop) {
          logger.info('AppHeader clearInterval')
          this.setState({isHide: true})
          clearInterval(this.timer)
        }
      } else {
        logger.info('AppHeader clearInterval')
        clearInterval(this.timer)
      }
    }, 2 * 1000) // check mm extension has installed on every 2s
  }

  componentWillReact () {
    logger.info('AppHeader componentWillReact')
  }

  componentWillUnmount () {
    logger.info('AppHeader componentWillUnmount')
    if (this.timer) {
      logger.info('AppHeader clearInterval')
      clearInterval(this.timer)
    }
  }

  render () {
    const { isLogin, userId, user, isInstalledOnChromeDesktop, isChrome, isMobile } = this.props.store
    const { showSignInModal, title, selectedTopics } = this.props.ui

    return (
      <Navbar className='header-nav animated fadeInDown' brand={brand(user)}>
        {
          !isLogin && selectedTopics.length > 0 &&
          <NavItem className='fadeIn'>
            <button style={{ fontSize: '1.2rem' }} className='btn btn-addto' onClick={this.showSignUp}> <i className='fa fa-sign-in' aria-hidden='true' /> Let's go!</button>
          </NavItem>
        }
        <NavItem>
          <a data-toggle='dropdown' style={{ color: '#666', fontWeight: 'normal', paddingTop: '30px' }}>
            Hiring
            <i className='fa fa-chevron-circle-down' aria-hidden='true' />
          </a>
          <ul className='dropdown-menu dropdown-hiring pull-right'>
            <li key={guid()}>
              <Link prefetch href='/hiring/?type=js' as='/hiring-js'>
                <a href='/hiring-js'><i className='fa fa-angle-right' aria-hidden='true' />  JavaScript / Node.JS Developer</a>
              </Link>
            </li>
            <li key={guid()}>
              <Link prefetch href='/hiring/?type=vp' as='/hiring-vp'>
                <a href='/hiring-vp'><i className='fa fa-angle-right' aria-hidden='true' />  Server & Platform Engineer / VP Engineering</a>
              </Link>
            </li>
          </ul>
        </NavItem>
        {
          (!isMobile && isLogin && isChrome && !isInstalledOnChromeDesktop) &&
          <NavItem>
            <button className='btn btn-addto' onClick={this.onOpenExtensionModal}> <i className='fa fa-plus' aria-hidden='true' /> ADD TO CHROME</button>
          </NavItem>
        }
        {
          isLogin && this.isOldHomePage() &&
          <NavItem>
            <a onClick={this.openShareManagement}>
              <i className='fa fa-share-alt fa-2x' aria-hidden='true' />
              <span className='nav-text'>Share Management</span>
            </a>
          </NavItem>
        }
        <NavItem>
          {userId > 0 &&
            <div className='dropdown account-dropdown'>
              <a className='dropdown-toggle' data-toggle='dropdown'>
                <img onError={this.noImage} className='image-account' src={avatar(user)} alt={userId} width='33' height='33' />
              </a>
              <a className='link-logout-res' onClick={this.onLogout}>
                <i className='fa fa-sign-out' />
                <span className='nav-text'>Sign Out</span>
              </a>
              <ul className='dropdown-menu pull-right'>
                {
                  user && user.name &&
                  <div className='account-dropdown__identity account-dropdown__segment'>
                  Signed in as <strong>({user.name} ({user.email}))</strong>
                  </div>
                }
                {
                  user && user.name &&
                  <li style={{color: '#333', backgroundColor: '#fff'}}>
                    <Link prefetch href={{ pathname: '/', query: { profileUrl: `/${user.nav_id}` } }} as={`/${user.nav_id}`}>
                      <a href={`/${user.nav_id}`}><i className='fa fa-magic' /> <strong>Your discover</strong></a>
                    </Link>
                  </li>
                }
                <li><button className='btn btn-logout' onClick={this.onLogout}><i className='fa fa-sign-out' /> Sign Out</button></li>
              </ul>
            </div>
          }
          {userId < 0 && <a style={{ color: '#666', fontWeight: 'normal', paddingTop: '30px' }} onClick={this.showSignIn}>Sign In</a>}
        </NavItem>
        <Modal
          isOpen={showSignInModal}
          onRequestClose={this.onClose}
          portalClassName='SignInModal'
          contentLabel={title}
          >
          <h2 ref='subtitle'>{title}</h2>
          <div className='social-action' >
            <div className='block-button'>
              <a className='btn btn-social btn-facebook' onClick={this.onFacebookLogin}>
                <i className='fa fa-facebook' /> {title} with Facebook
               </a>
            </div>
            <div className='block-button'>
              <a className='btn btn-social btn-google' onClick={this.onGoogleLogin}>
                <i className='fa fa-google' /> {title} with Google
                </a>
            </div>
            <div className='block-button'>
              <a className='btn btn-social btn-internal-lab' onClick={this.onInternalLogin}>
                <i className='fa icon-internal-lab' /> Test Internal: New User
                </a>
            </div>
          </div>
        </Modal>
        <Modal
          isOpen={this.props.ui.showExtensionModal}
          onRequestClose={this.onCloseExtensionModal}
          portalClassName='InstallModal'
          style={customModalStyles}
          contentLabel='Install maomao'>
          <div className='install-modal-content'>
            <div className='modal-header'>
              <h4 className='modal-title'>Install maomao</h4>
            </div>
            <div className='modal-body'>
              <div className='install-description'>
                <h3><img className='logo-image' src='/static/images/maomao.png' alt='maomao' /> lets you share topics with friends</h3>
                <br />
                <p><img className='logo-image' src='/static/images/maomao.png' alt='maomao' /> only shares what you tell it, when you tell it. </p>
                <button className='btn btn-install' type='button' onClick={this.inlineInstall}>Ok! Give me <img className='logo-image' src='/static/images/maomao.png' alt='maomao' /></button>
              </div>
            </div>
          </div>
        </Modal>
      </Navbar>
    )
  }
}

export default AppHeader
