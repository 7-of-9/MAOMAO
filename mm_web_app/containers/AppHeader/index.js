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
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
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
        { this.props.store.isLogin && <button onClick={this.onLogout}>Logout</button> }
        { !this.props.store.isLogin && <button className='btn btn-login' onClick={this.onOpen}>Sign In</button> }
        <Modal
          isOpen={this.state.showModal}
          onRequestClose={this.onClose}
          style={customStyles}
          contentLabel='Sign In Modal'
        >
          <h2 ref='subtitle'>Sign In</h2>
          <div className='container'>
            <div className='row justify-content-md-center'>
              <GoogleLogin
                clientId={GOOGLE_CLIENT_ID}
                scope='profile email https://www.googleapis.com/auth/contacts.readonly'
                buttonText='LOGIN WITH GOOGLE'
                onSuccess={this.onGoogleSuccess}
                onFailure={this.onGoogleFailure}
                />
            </div>
            <div className='row justify-content-md-center'>
              <FacebookLogin
                appId={FACEBOOK_APP_ID}
                autoLoad={false}
                size='medium'
                fields='name,email,picture'
                callback={this.responseFacebook}
               />
            </div>
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
