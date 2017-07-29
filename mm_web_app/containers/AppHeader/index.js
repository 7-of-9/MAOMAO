/*
 *
 * AppHeader
 *
 */

import React from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'
import { inject, observer } from 'mobx-react'
import firebase from 'firebase'
import 'isomorphic-fetch'
import Modal from 'react-modal'
import { Navbar, NavItem } from 'neal-react'
import Header from '../../components/Header'
import LogoIcon from '../../components/LogoIcon'
import Slogan from '../../components/Slogan'
import { guid } from '../../utils/hash'
import { clientCredentials } from '../../firebaseCredentials'
import logger from '../../utils/logger'

const brand = <Header><LogoIcon /><Slogan /></Header>

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
class AppHeader extends React.PureComponent {
  /* global fetch */
  componentDidMount () {
    logger.warn('AppHeader componentDidMount')
    if (firebase.apps.length === 0) {
      firebase.initializeApp(clientCredentials)
      firebase.auth().onAuthStateChanged(user => {
        logger.warn('firebase - onAuthStateChanged', user)
        if (user) {
          logger.warn('firebase - user', user)
          const { photoURL } = user
          return user.getIdToken()
          .then((token) => {
            if (this.props.store.userId < 0) {
              if (!user.isAnonymous) {
                this.props.notify(`Welcome, ${user.displayName}!`)
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
                  logger.warn('logged-in user', json)
                  if (!user.isAnonymous) {
                    const { decodedToken: { email, name, picture, firebase: { sign_in_provider, identities } } } = json
                  /* eslint-disable camelcase */
                    logger.warn('sign_in_provider', sign_in_provider)
                    logger.warn('identities', identities)
                    let fb_user_id = identities['facebook.com'] && identities['facebook.com'][0]
                    let google_user_id = identities['google.com'] && identities['google.com'][0]
                    let user_email = identities['email'] && identities['email'][0]
                    if (sign_in_provider === 'google.com') {
                      if (!email) {
                        user.providerData.forEach(item => {
                          if (item.providerId === sign_in_provider) {
                            this.props.store.googleConnect({
                              email: item.email, name, picture, google_user_id
                            })
                          }
                        })
                      } else {
                        this.props.store.googleConnect({
                          email, name, picture, google_user_id
                        })
                      }
                    } else if (sign_in_provider === 'facebook.com') {
                      if (!email) {
                        user.providerData.forEach(item => {
                          if (item.providerId === sign_in_provider) {
                            this.props.store.facebookConnect({
                              email: item.email, name, picture, fb_user_id
                            })
                          }
                        })
                      } else {
                        this.props.store.facebookConnect({
                          email, name, picture, fb_user_id
                        })
                      }
                    } else if (sign_in_provider === 'password') {
                      logger.warn('found user email', user_email)
                      logger.warn('photoURL', photoURL)
                      // hack here, try to store intenal user
                      try {
                        const loggedUser = JSON.parse(photoURL)
                        this.props.store.retrylLoginForInternalUser(loggedUser)
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
  }

  componentWillReact () {
    logger.warn('AppHeader componentWillReact')
  }

  onInternalLogin = () => {
    logger.warn('onInternalLogin', this.props)
    this.props.notify('Test Internal: New User')
    this.props.ui.toggleSignIn(false)
    this.props.store.internalLogin((user) => {
      logger.warn('test user', user)
      const { email, name: displayName } = user
      firebase.auth().createUserWithEmailAndPassword(email, 'maomao').then((newUser) => {
        newUser.updateProfile({
          displayName,
          photoURL: JSON.stringify(user)
        }).catch((error) => {
          this.props.notify(error.message)
        })
      }).catch((error) => {
        this.props.notify(error.message)
      })
    })
  }

  onFacebookLogin = (evt) => {
    evt.preventDefault()
    logger.warn('onFacebookLogin', this.props, evt)
    const provider = new firebase.auth.FacebookAuthProvider()
    provider.addScope('email')
    firebase.auth().signInWithPopup(provider).catch((error) => {
      this.props.notify(error.message)
    })
  }

  onGoogleLogin = (evt) => {
    evt.preventDefault()
    logger.warn('onGoogleLogin', this.props, evt)
    const provider = new firebase.auth.GoogleAuthProvider()
    provider.addScope('https://www.googleapis.com/auth/plus.me')
    provider.addScope('https://www.googleapis.com/auth/userinfo.email')
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly')
    firebase.auth().signInWithPopup(provider).catch((error) => {
      this.props.notify(error.message)
    })
  }

  onLogout = (evt) => {
    evt.preventDefault()
    logger.warn('onLogout', this.props)
    firebase.auth().signOut().then(() => {
      fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin'
      }).then(() => {
        this.props.store.logoutUser()
      })
      this.props.notify('You have successfully signed out.')
    }).catch((error) => {
      logger.warn(error)
    })
  }

  onClose = () => {
    logger.warn('onClose', this.props)
    this.props.ui.toggleSignIn(false)
  }

  showSignIn = (evt) => {
    evt.preventDefault()
    this.props.ui.toggleSignIn(true, 'Sign In')
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

  render () {
    const { isLogin, userId, user, isInstall, isChrome, isMobile } = this.props.store
    const { showSignInModal, title } = this.props.ui
    return (
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
          (isMobile || !isChrome || (isChrome && isInstall)) &&
          <NavItem>
            <button className='btn btn-addto' onClick={this.onOpenExtensionModal}> <i className='fa fa-plus' aria-hidden='true' /> ADD TO CHROME</button>
          </NavItem>
        }
        {
          isLogin &&
          <NavItem>
            <a onClick={this.openShareManagement}>
              <i className='fa fa-share-alt fa-2x' aria-hidden='true' />
              <span className='nav-text'>Share Management</span>
            </a>
          </NavItem>
        }
        <NavItem>
          {isLogin &&
            <div className='dropdown account-dropdown'>
              <a className='dropdown-toggle' data-toggle='dropdown'>
                <img onError={this.noImage} className='image-account' src={avatar(user)} alt={userId} width='33' height='33' />
              </a>
              <a className='link-logout-res' onClick={this.onLogout}>
                <i className='fa fa-sign-out' />
                <span className='nav-text'>Sign Out</span>
              </a>
              <ul className='dropdown-menu pull-right'>
                {user && user.name &&
                  <div className='account-dropdown__identity account-dropdown__segment'>
                    Signed in as <strong>{user.name} ({user.email})</strong>
                  </div>
                }
                <li><button className='btn btn-logout' onClick={this.onLogout}><i className='fa fa-sign-out' /> Sign Out</button></li>
              </ul>
            </div>
          }
          {!isLogin && <button className='btn btn-login' onClick={this.showSignIn}><i className='fa fa-sign-in' aria-hidden='true' /> Sign In</button>}
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
        </NavItem>
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
                <button className='btn btn-install' type='button' onClick={this.props.install}>Ok! Give me <img className='logo-image' src='/static/images/maomao.png' alt='maomao' /></button>
              </div>
            </div>
          </div>
        </Modal>
      </Navbar>
    )
  }
}

AppHeader.propTypes = {
  notify: PropTypes.func.isRequired,
  install: PropTypes.func.isRequired,
  isHome: PropTypes.bool
}

AppHeader.defaultProps = {
  notify: () => {},
  install: () => {},
  isHome: true
}

export default AppHeader
