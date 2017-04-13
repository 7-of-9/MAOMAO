/*
 *
 * AppHeader
 *
 */

import React from 'react'
import PropTypes from 'prop-types'
import GoogleLogin from 'react-google-login'
import FacebookLogin from 'react-facebook-login'
import { GOOGLE_CLIENT_ID, FACEBOOK_APP_ID } from '../../containers/App/constants'
import Header from '../../components/Header'
import DiscoveryButton from '../../components/DiscoveryButton'
import LogoIcon from '../../components/LogoIcon'
import Slogan from '../../components/Slogan'
import Logout from '../../components/Logout'

function AppHeader ({ breadcrumb, onGoogleSuccess, onGoogleFailure, onLogout, responseFacebook }) {
  return (
    <Header>
      <LogoIcon />
      <Slogan />
      <GoogleLogin
        clientId={GOOGLE_CLIENT_ID}
        buttonText='LOGIN WITH GOOGLE'
        onSuccess={onGoogleSuccess}
        onFailure={onGoogleFailure}
      />
      <FacebookLogin
        appId={FACEBOOK_APP_ID}
        autoLoad={false}
        size='medium'
        fields='name,email,picture'
        callback={responseFacebook}
      />
      <Logout onLogout={onLogout} />
      <DiscoveryButton />
    </Header>
  )
}

AppHeader.propTypes = {
  breadcrumb: PropTypes.string,
  onGoogleSuccess: PropTypes.func,
  onGoogleFailure: PropTypes.func,
  responseFacebook: PropTypes.func,
  onLogout: PropTypes.func
}

export default AppHeader
