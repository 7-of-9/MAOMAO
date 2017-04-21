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
    left: '50%',
    right: 'auto',
    bottom: 'auto'
  }
}

@inject('store') @observer
class AppHeader extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showModal: false
    }
    this.onGoogleSuccess = this.onGoogleSuccess.bind(this)
    this.onGoogleFailure = this.onGoogleFailure.bind(this)
    this.responseFacebook = this.responseFacebook.bind(this)
    this.onLogout = this.onLogout.bind(this)
    this.onClose = this.onClose.bind(this)
    this.onOpen = this.onOpen.bind(this)
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

  onOpen () {
    this.setState({ showModal: true })
  }

  onClose () {
    this.setState({ showModal: false })
  }

  onGoogleSuccess (response) {
    logger.info('onGoogleSuccess', response)
    if (response.error) {
      this.props.notify(response.error)
    } else {
      this.onClose()
      this.props.notify('Login with google account...')
      this.props.store.googleConnect(response)
    }
  }

  onGoogleFailure (error) {
    logger.info('onGoogleSuccess', error)
    this.props.notify(error.message)
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
        { !this.props.store.isLogin && <button className='btn btn-login' onClick={this.onOpen}><i className='fa fa-sign-in' aria-hidden='true' /> Sign In</button> }
        <Modal
          isOpen={this.state.showModal}
          onRequestClose={this.onClose}
          style={customStyles}
          portalClassName='SignInModal'
          contentLabel='Sign In Modal'
        >
          <h2 ref='subtitle'>Sign In</h2>
          <form className='form-signup'>
            <div className='form-group'>
              <input className='form-control' type='email' placeholder='Email' />
            </div>
            <div className='form-group'>
              <input className='form-control' type='password' placeholder='Password' />
            </div>
            <button className='btn btn-signin' type='submit'>Sign In</button>
            <div className='wrap-label'> <span className='title'>Or sign in with</span> </div>
          </form>
          <div className='justify-content-md-center social-action'>
            <GoogleLogin
              clientId={GOOGLE_CLIENT_ID}
              scope='profile email https://www.googleapis.com/auth/contacts.readonly'
              buttonText='LOGIN WITH GOOGLE'
              className='btn btn-google'
              onSuccess={this.onGoogleSuccess}
              onFailure={this.onGoogleFailure}
              />
            <FacebookLogin
              appId={FACEBOOK_APP_ID}
              autoLoad={false}
              size='small'
              fields='name,email,picture'
              cssClass='btn btn-facebook'
              callback={this.responseFacebook}
             />
          </div>
          <p className='paragraph-question'> Don't have an account? <a href='#'>Sign Up</a> </p>
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
