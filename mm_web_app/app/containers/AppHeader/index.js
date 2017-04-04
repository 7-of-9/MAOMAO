/*
 *
 * AppHeader
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import Header from 'components/Header';
import DiscoveryButton from 'components/DiscoveryButton';
import LogoIcon from 'components/LogoIcon';
import ShareWithFriends from 'components/ShareWithFriends';
import Slogan from 'components/Slogan';
import Logout from 'components/Logout';
import { googleConnect, googleConnectLoadingError, facebookConnect, logoutUser } from 'containers/App/actions';
import GoogleLogin from 'react-google-login';
import FacebookLogin from 'react-facebook-login';
import { hasInstalledExtension } from 'utils/chrome';
import { isLogin, logout } from 'utils/simpleAuth';
import { makeSelectCurrentUser } from 'containers/App/selectors';
import { FACEBOOK_APP_ID, GOOGLE_CLIENT_ID } from 'containers/App/constants';

function AppHeader({ breadcrumb, friends, onGoogleSuccess, onGoogleFailure, onLogout, responseFacebook }) {
  return (
    <Header>
      <LogoIcon />
      <Slogan />
      { breadcrumb && <h3>{breadcrumb}</h3>}
      <div style={{ position: 'absolute', top: '65px', right: '40px' }}>
        {isLogin() && friends && friends.length > 0 && <ShareWithFriends friends={friends} />}
        {
          !isLogin() && hasInstalledExtension() &&
          <GoogleLogin
            clientId={GOOGLE_CLIENT_ID}
            buttonText="LOGIN WITH GOOGLE"
            onSuccess={onGoogleSuccess}
            onFailure={onGoogleFailure}
          />
      }
        {
          !isLogin() && hasInstalledExtension() &&
          <FacebookLogin
            appId={FACEBOOK_APP_ID}
            autoLoad={false}
            size="medium"
            fields="name,email,picture"
            callback={responseFacebook}
          />
      }
        {isLogin() && hasInstalledExtension() && <Logout onLogout={onLogout} /> }
        <DiscoveryButton />
      </div>
    </Header>
  );
}

AppHeader.propTypes = {
  breadcrumb: PropTypes.string,
  friends: PropTypes.array.isRequired,
  onGoogleSuccess: PropTypes.func.isRequired,
  onGoogleFailure: PropTypes.func.isRequired,
  responseFacebook: PropTypes.func.isRequired,
  onLogout: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  currentUser: makeSelectCurrentUser(),
});

// TODO: Revoke token for fb/gg when user logout

function mapDispatchToProps(dispatch) {
  return {
    responseFacebook: (response) => {
      dispatch(facebookConnect(response));
    },
    onGoogleSuccess: (response) => {
      dispatch(googleConnect(response));
    },
    onGoogleFailure: (error) => {
      dispatch(googleConnectLoadingError(error));
    },
    onLogout: () => {
      dispatch(logoutUser());
      logout(() => {
        window.location.reload();
      });
    },
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppHeader);
