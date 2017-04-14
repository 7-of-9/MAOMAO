/*
 *
 * AppHeader
 *
 */

import React from 'react'
import PropTypes from 'prop-types'
import GoogleLogin from 'react-google-login'
import FacebookLogin from 'react-facebook-login'
import { NavItem } from 'neal-react'
import Logout from '../../components/Logout'
import { FACEBOOK_APP_ID, GOOGLE_CLIENT_ID } from '../../containers/App/constants'

function AppHeader ({ isLogin, onGoogleSuccess, onGoogleFailure, onLogout, responseFacebook }) {
  return (
    <NavItem>
      {
        !isLogin &&
        <GoogleLogin
          clientId={GOOGLE_CLIENT_ID}
          buttonText='LOGIN WITH GOOGLE'
          onSuccess={onGoogleSuccess}
          onFailure={onGoogleFailure}
        />
    }
      {
        !isLogin &&
        <FacebookLogin
          appId={FACEBOOK_APP_ID}
          autoLoad={false}
          size='medium'
          fields='name,email,picture'
          callback={responseFacebook}
        />
    }
      {isLogin && <Logout onLogout={onLogout} /> }
    </NavItem>
  )
}

AppHeader.propTypes = {
  isLogin: PropTypes.bool.isRequired,
  breadcrumb: PropTypes.string,
  onGoogleSuccess: PropTypes.func,
  onGoogleFailure: PropTypes.func,
  responseFacebook: PropTypes.func,
  onLogout: PropTypes.func
}

export default AppHeader
