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
import Logout from '../../components/Logout'
import { FACEBOOK_APP_ID, GOOGLE_CLIENT_ID } from '../../containers/App/constants'

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

  onOpen () {
    logger.warn('onOpen')
    this.setState({ showModal: true })
  }

  onClose () {
    this.setState({ showModal: false })
  }

  onGoogleSuccess (response) {
    logger.warn('onGoogleSuccess', response)
    this.onClose()
    this.props.notify('Login with google account...')
    this.props.store.googleConnect(response)
  }

  onGoogleFailure (error) {
    logger.warn('onGoogleSuccess', error)
    this.props.notify(error.message)
  }

  responseFacebook (response) {
    logger.warn('responseFacebook', response)
    this.onClose()
    this.props.notify('Login with facebook account...')
    this.props.store.facebookConnect(response)
  }

  onLogout () {
    logger.warn('onLogout')
    this.props.store.logoutUser()
    this.props.notify('Logout.')
  }

  render () {
    logger.warn('AppHeader', this.props, this.state)
    return (
      <NavItem>
        { this.props.store.isLogin && <Logout onLogout={this.onLogout} /> }
        { !this.props.store.isLogin && <button onClick={this.onOpen}>Sign In</button> }
        <Modal
          isOpen={this.state.showModal}
          onRequestClose={this.onClose}
          style={customStyles}
          contentLabel='Sign In'>
          <h1>Sign In</h1>
          <GoogleLogin
            clientId={GOOGLE_CLIENT_ID}
            buttonText='LOGIN WITH GOOGLE'
            onSuccess={this.onGoogleSuccess}
            onFailure={this.onGoogleFailure}
          />
          <br />
          <FacebookLogin
            appId={FACEBOOK_APP_ID}
            autoLoad={false}
            size='medium'
            fields='name,email,picture'
            callback={this.responseFacebook}
          />
          <br />
          <button onClick={this.onClose}>close</button>
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
