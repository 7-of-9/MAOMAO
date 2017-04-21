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
import * as logger from 'loglevel'
import { FACEBOOK_APP_ID, GOOGLE_CLIENT_ID } from '../../containers/App/constants'
import { sendMsgToChromeExtension, actionCreator } from '../../utils/chrome'

const customStyles = {
  content: {
    top: '90px',
    right: 'auto',
    bottom: 'auto'
  }
}

@inject('store') @observer
class AppHeader extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showSignInModal: false,
      showSignUpModal: false
    }
    this.onGoogleSuccess = this.onGoogleSuccess.bind(this)
    this.onGoogleFailure = this.onGoogleFailure.bind(this)
    this.responseFacebook = this.responseFacebook.bind(this)
    this.onLogout = this.onLogout.bind(this)
    this.onClose = this.onClose.bind(this)
    this.onSignInOpen = this.onSignInOpen.bind(this)
    this.onSignUpOpen = this.onSignUpOpen.bind(this)
  }

  componentDidMount () {
    logger.info('componentDidMount - AppHeader', this.props.store)
    if (this.props.store.isInstalledOnChromeDesktop) {
      sendMsgToChromeExtension(actionCreator('WEB_CHECK_AUTH', {}), (error, data) => {
        if (error) {
          logger.error(error)
        } else {
          this.props.store.autoLogin(data.payload)
        }
      })
    }
  }

  onSignInOpen () {
    this.setState({
      showSignInModal: true,
      showSignUpModal: false
    })
  }

  onSignUpOpen (show) {
    this.setState({
      showSignInModal: false,
      showSignUpModal: true
    })
  }

  onClose () {
    this.setState({
      showSignInModal: false,
      showSignUpModal: false
    })
  }

  onGoogleSuccess (response) {
    logger.info('onGoogleSuccess', response)
    this.onClose()
    this.props.notify('Login with google account...')
    this.props.store.googleConnect(response)
  }

  onGoogleFailure (response) {
    logger.info('onGoogleFailure', response)
    this.props.notify(response.error)
  }

  responseFacebook (response) {
    logger.info('responseFacebook', response)
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
    logger.info('AppHeader', this.props, this.state)
    return (
      <NavItem>
        { this.props.store.isLogin && <button className='btn btn-logout' onClick={this.onLogout}><i className='fa fa-sign-out' aria-hidden='true' /> Logout</button> }
        { !this.props.store.isLogin && <button className='btn btn-login' onClick={this.onSignInOpen}><i className='fa fa-sign-in' aria-hidden='true' /> Sign In</button> }
        <Modal
          isOpen={this.state.showSignInModal}
          onRequestClose={this.onClose}
          style={customStyles}
          portalClassName='SignInModal'
          contentLabel='Sign In Modal'
        >
          <h2 ref='subtitle'>Sign In</h2>
          <div className='justify-content-md-center social-action'>
            <GoogleLogin
              clientId={GOOGLE_CLIENT_ID}
              scope='profile email https://www.googleapis.com/auth/contacts.readonly'
              buttonText='SIGN IN WITH GOOGLE'
              className='btn btn-google'
              onSuccess={this.onGoogleSuccess}
              onFailure={this.onGoogleFailure}
              />
            <FacebookLogin
              appId={FACEBOOK_APP_ID}
              autoLoad={false}
              size='small'
              textButton='SIGN IN WITH FACEBOOK'
              fields='name,email,picture'
              cssClass='btn btn-facebook'
              callback={this.responseFacebook}
             />
          </div>
          <p className='paragraph-question'> Don't have an account? <a onClick={this.onSignUpOpen}>Sign Up</a> </p>
        </Modal>
        <Modal
          isOpen={this.state.showSignUpModal}
          onRequestClose={this.onClose}
          style={customStyles}
          portalClassName='SignInModal'
          contentLabel='Sign Up Modal'
        >
          <h2 ref='subtitle'>Sign Up</h2>
          {/*
          <form className='form-signup'>
            <div className='form-group'>
              <input className='form-control' type='email' placeholder='Email' />
            </div>
            <div className='form-group'>
              <input className='form-control' type='password' placeholder='Password' />
            </div>
            <button className='btn btn-signin' type='submit'>Sign Up</button>
            <div className='wrap-label'> <span className='title'>Or sign up with</span> </div>
          </form>
          */}
          <div className='justify-content-md-center social-action'>
            <GoogleLogin
              clientId={GOOGLE_CLIENT_ID}
              scope='profile email https://www.googleapis.com/auth/contacts.readonly'
              buttonText='SIGN UP WITH GOOGLE'
              className='btn btn-google'
              onSuccess={this.onGoogleSuccess}
              onFailure={this.onGoogleFailure}
              />
            <FacebookLogin
              appId={FACEBOOK_APP_ID}
              autoLoad={false}
              textButton='SIGN UP WITH FACEBOOK'
              size='small'
              fields='name,email,picture'
              cssClass='btn btn-facebook'
              callback={this.responseFacebook}
             />
          </div>
          <p className='paragraph-question'> Do have an account? <a onClick={this.onSignInOpen}>Sign In</a> </p>
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
