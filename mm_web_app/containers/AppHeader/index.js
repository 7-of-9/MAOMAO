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
          return user.getToken()
          .then((token) => {
            // eslint-disable-next-line no-undef
            return fetch('/api/login', {
              method: 'POST',
              // eslint-disable-next-line no-undef
              headers: new Headers({ 'Content-Type': 'application/json' }),
              credentials: 'same-origin',
              body: JSON.stringify({ token })
            }).then((res) => {
              // register for new user
              this.props.ui.closeModal()
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
                    this.props.store.googleConnect({
                      email, name, picture, google_user_id
                    })
                  } else if (sign_in_provider === 'facebook.com') {
                    this.props.store.facebookConnect({
                      email, name, picture, fb_user_id
                    })
                  }
                })
              }
            })
          })
        } else {
        // eslint-disable-next-line no-undef
          fetch('/api/logout', {
            method: 'POST',
            credentials: 'same-origin'
          }).then((res) => logger.warn('res', res))
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
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
  }

  onFacebookLogin () {
    firebase.auth().signInWithPopup(new firebase.auth.FacebookAuthProvider())
  }

  onSignInOpen () {
    this.props.ui.showSignIn()
  }

  onClose () {
    this.props.ui.closeModal()
  }

  onLogout () {
    firebase.auth().signOut()
    this.props.store.logoutUser()
    this.props.notify('Logout.')
  }

  render () {
    return (
      <NavItem>
        { this.props.store.isLogin && <button className='btn btn-logout' onClick={this.onLogout}><i className='fa fa-sign-out' aria-hidden='true' /> Logout</button> }
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
