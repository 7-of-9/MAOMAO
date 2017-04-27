/*
 *
 * AppHeader
 *
 */

import React from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import GoogleLogin from 'react-google-login'
import FacebookLogin from 'react-facebook-login'
import { NavItem } from 'neal-react'
import Modal from 'react-modal'
import { FACEBOOK_APP_ID, GOOGLE_CLIENT_ID } from '../../containers/App/constants'
import { sendMsgToChromeExtension, actionCreator } from '../../utils/chrome'

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
    this.onGoogleSuccess = this.onGoogleSuccess.bind(this)
    this.onGoogleFailure = this.onGoogleFailure.bind(this)
    this.responseFacebook = this.responseFacebook.bind(this)
    this.onLogout = this.onLogout.bind(this)
    this.onClose = this.onClose.bind(this)
    this.onSignInOpen = this.onSignInOpen.bind(this)
  }

  componentDidMount () {
    if (this.props.store.isInstalledOnChromeDesktop) {
      sendMsgToChromeExtension(actionCreator('WEB_CHECK_AUTH', {}), (error, data) => {
        if (error) {
        } else {
          this.props.store.autoLogin(data.payload)
        }
      })
    }
  }

  onSignInOpen () {
    this.props.ui.showSignIn()
  }

  onClose () {
    this.props.ui.closeModal()
  }

  onGoogleSuccess (response) {
    this.onClose()
    this.props.notify('Login with google account...')
    this.props.store.googleConnect(response)
  }

  onGoogleFailure (response) {
    this.props.notify(response.error)
  }

  responseFacebook (response) {
    if (response && response.id) {
      this.onClose()
      this.props.notify('Login with facebook account...')
      this.props.store.facebookConnect(response)
    }
  }

  onLogout () {
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
            <a className="btn btn-facebook"> Sign in with Facebook</a>
            <a className="btn btn-google">Sign in with Google</a>
            {/*<GoogleLogin
              clientId={GOOGLE_CLIENT_ID}
              scope='profile email https://www.googleapis.com/auth/contacts.readonly'
              buttonText='CONNECT WITH GOOGLE'
              className='btn btn-google'
              onSuccess={this.onGoogleSuccess}
              onFailure={this.onGoogleFailure}
              />
            <FacebookLogin
              appId={FACEBOOK_APP_ID}
              autoLoad={false}
              size='small'
              textButton='CONNECT WITH FACEBOOK'
              fields='name,email,picture'
              cssClass='btn btn-facebook'
              callback={this.responseFacebook}
             />*/}
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
