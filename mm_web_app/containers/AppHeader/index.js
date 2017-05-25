/*
 *
 * AppHeader
 *
 */

import React from 'react'
import PropTypes from 'prop-types'
import { compose, withHandlers, lifecycle, pure } from 'recompose'
import firebase from 'firebase'
import 'isomorphic-fetch'
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

const enhance = compose(
  withHandlers({
    onGoogleLogin: props => () => {
      const provider = new firebase.auth.GoogleAuthProvider()
      provider.addScope('https://www.googleapis.com/auth/plus.me')
      provider.addScope('https://www.googleapis.com/auth/userinfo.email')
      provider.addScope('https://www.googleapis.com/auth/contacts.readonly')
      firebase.auth().signInWithPopup(provider)
    },
    onFacebookLogin: props => () => {
      const provider = new firebase.auth.FacebookAuthProvider()
      provider.addScope('email')
      firebase.auth().signInWithPopup(provider)
    },
    onSignInOpen: props => () => {
      props.ui.showSignIn()
    },
    onClose: props => () => {
      props.ui.closeModal()
    },
    onLogout: props => () => {
      firebase.auth().signOut().then(() => {
        fetch('/api/logout', {
          method: 'POST',
          credentials: 'same-origin'
        }).then(() => {
          props.store.logoutUser()
        })
        props.notify('You have successfully signed out.')
      }).catch((error) => {
        logger.warn(error)
      })
    }
  }),
  lifecycle({
    componentDidMount () {
      logger.warn('AppHeader componentDidMount')
      if (firebase.apps.length === 0) {
        firebase.initializeApp(clientCredentials)
        firebase.auth().onAuthStateChanged(user => {
          if (user) {
            logger.warn('user', user)
            return user.getIdToken()
          .then((token) => {
            /* global fetch */
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
  }),
  pure
)

const AppHeader = enhance(({
  store, ui,
  onLogout, onSignInOpen, onClose,
  onFacebookLogin, onGoogleLogin
}) => (
  <NavItem>
    { store.isLogin &&
    <div className='dropdown account-dropdown'>
      <a className='dropdown-toggle' data-toggle='dropdown'>
        <img className='image-account' src={store.avatar} alt={store.userId} width='33' height='33' />
      </a>
      <a className='link-logout-res' onClick={onLogout}>
        <i className='fa fa-sign-out' />
        <span className='nav-text'>Sign Out</span>
      </a>
      <ul className='dropdown-menu pull-right'>
        { store.user && store.user.name &&
        <div className='account-dropdown__identity account-dropdown__segment'>
                Signed in as <strong>{store.user.name}</strong>
        </div>
              }
        <li><button className='btn btn-logout' onClick={onLogout}><i className='fa fa-sign-out' /> Sign Out</button></li>
      </ul>
    </div>
        }
    { !store.isLogin && <button className='btn btn-login' onClick={onSignInOpen}><i className='fa fa-sign-in' aria-hidden='true' /> Sign In</button> }
    <Modal
      isOpen={ui.showSignInModal}
      onRequestClose={onClose}
      style={customStyles}
      portalClassName='SignInModal'
      contentLabel='Sign In Modal'
        >
      <h2 ref='subtitle'>SIGN IN</h2>
      <div className='justify-content-md-center social-action'>
        <a className='btn btn-facebook' onClick={onFacebookLogin}> Sign in with Facebook</a>
        <a className='btn btn-google' onClick={onGoogleLogin}>Sign in with Google</a>
      </div>
    </Modal>
  </NavItem>
))

AppHeader.propTypes = {
  notify: PropTypes.func.isRequired,
  store: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired
}

export default AppHeader
