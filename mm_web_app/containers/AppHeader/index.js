/*
 *
 * AppHeader
 *
 */

import React from 'react'
import PropTypes from 'prop-types'
import firebase from 'firebase'
import 'isomorphic-fetch'
import { inject, observer } from 'mobx-react'
import { NavItem } from 'neal-react'
import Modal from 'react-modal'
import { sendMsgToChromeExtension, actionCreator } from '../../utils/chrome'
import { clientCredentials } from '../../firebaseCredentials'
import logger from '../../utils/logger'

const customStyles = {
  content: {
    top: '90px',
    right: 'auto',
    bottom: 'auto'
  }
}

@inject('store')
@inject('ui')
@observer
class AppHeader extends React.Component {
  constructor (props) {
    super(props)
    this.onLogout = this.onLogout.bind(this)
    this.onClose = this.onClose.bind(this)
    this.onGoogleLogin = this.onGoogleLogin.bind(this)
    this.onSignInOpen = this.onSignInOpen.bind(this)
  }

  componentDidMount () {
    logger.warn('AppHeader componentDidMount')
    if (firebase.apps.length === 0) {
      firebase.initializeApp(clientCredentials)
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          logger.warn('user', user)
          return user.getToken()
          .then((token) => {
            /* global fetch */
            this.props.ui.closeModal()
            this.props.notify(`Welcome, ${user.displayName}!`)
            return fetch('/api/login', {
              method: 'POST',
              // eslint-disable-next-line no-undef
              headers: new Headers({ 'Content-Type': 'application/json' }),
              credentials: 'same-origin',
              body: JSON.stringify({ token })
            }).then((res) => {
              // register for new user
              if (this.props.store.userId < 0) {
                res.json().then(json => {
                  // register new user
                  logger.warn('user', json)
                  const { decodedToken: { email, name, picture, firebase: { sign_in_provider, identities } } } = json
                  /* eslint-disable camelcase */
                  logger.warn('sign_in_provider', sign_in_provider)
                  logger.warn('identities', identities)
                  let fb_user_id = identities['facebook.com'] && identities['facebook.com'][0]
                  let google_user_id = identities['google.com'] && identities['google.com'][0]
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
                  }
                })
              }
            })
          })
        }
      })
    }

    if (this.props.store.isInstalledOnChromeDesktop) {
      sendMsgToChromeExtension(actionCreator('WEB_CHECK_AUTH', {}), (error, data) => {
        if (error) {
        } else {
          this.props.store.autoLogin(data.payload)
        }
      })
    }
  }

  onGoogleLogin () {
    const provider = new firebase.auth.GoogleAuthProvider()
    provider.addScope('https://www.googleapis.com/auth/plus.me')
    provider.addScope('https://www.googleapis.com/auth/userinfo.email')
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly')
    firebase.auth().signInWithPopup(provider)
  }

  onFacebookLogin () {
    const provider = new firebase.auth.FacebookAuthProvider()
    provider.addScope('email')
    firebase.auth().signInWithPopup(provider)
  }

  onSignInOpen () {
    this.props.ui.showSignIn()
  }

  onClose () {
    this.props.ui.closeModal()
  }

  onLogout () {
    firebase.auth().signOut().then(() => {
      fetch('/api/logout', {
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

  render () {
    return (
      <NavItem>
        { this.props.store.isLogin &&
          <div className='dropdown account-dropdown'>
            <a className='dropdown-toggle' href='#' data-toggle='dropdown'>
              <img className='image-account' src={this.props.store.avatar} alt={this.props.store.userId} width='33' height='33' />
            </a>
            <ul className='dropdown-menu pull-right'>
              { this.props.store.user && this.props.store.user.name &&
                <div className='account-dropdown__identity account-dropdown__segment'>
                Signed in as <strong>{this.props.store.user.name}</strong>
                </div>
              }
              <li><button className='btn btn-logout' onClick={this.onLogout}><i className='fa fa-sign-out' /> Sign Out</button></li>
            </ul>
          </div>
        }
        { !this.props.store.isLogin && <button className='btn btn-login' onClick={this.onSignInOpen}><i className='fa fa-sign-in' aria-hidden='true' /> Sign In</button> }
        <Modal
          isOpen={this.props.ui.showSignInModal}
          onRequestClose={this.onClose}
          style={customStyles}
          portalClassName='SignInModal'
          contentLabel='Sign In Modal'
        >
          <h2 ref='subtitle'>SIGN IN</h2>
          <div className='justify-content-md-center social-action'>
            <a className='btn btn-facebook' onClick={this.onFacebookLogin}> Sign in with Facebook</a>
            <a className='btn btn-google' onClick={this.onGoogleLogin}>Sign in with Google</a>
          </div>
        </Modal>
      </NavItem>
    )
  }
}

AppHeader.propTypes = {
  onGoogleSuccess: PropTypes.func,
  onGoogleFailure: PropTypes.func,
  responseFacebook: PropTypes.func,
  notify: PropTypes.func,
  onLogout: PropTypes.func
}

export default AppHeader
