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
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody } from 'react-modal-bootstrap'
import * as logger from 'loglevel'
import { FACEBOOK_APP_ID, GOOGLE_CLIENT_ID } from '../../containers/App/constants'
import { sendMsgToChromeExtension, actionCreator } from '../../utils/chrome'

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
    if (this.props.store.isInstalledOnChromeDesktop) {
      logger.warn('componentDidMount - Sending data to extension')
      sendMsgToChromeExtension(actionCreator('WEB_CHECK_AUTH', {}), (error, data) => {
        if (error) {
          logger.warn(error)
        } else {
          this.props.store.autoLogin(data.payload)
        }
      })
    }
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
        { this.props.store.isLogin && <button onClick={this.onLogout}>Logout</button> }
        { !this.props.store.isLogin && <button className="btn btn-login" onClick={this.onOpen}>Sign In</button> }
        <Modal
          isOpen={this.state.showModal}
          onRequestHide={this.onClose}
          >
          <ModalHeader>
            <ModalClose onClick={this.onClose} />
            <ModalTitle>Join MaoMao Now!</ModalTitle>
          </ModalHeader>
          <ModalBody>
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
          </ModalBody>
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
