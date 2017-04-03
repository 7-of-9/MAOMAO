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
import { googleConnect, googleConnectLoadingError, logoutUser } from 'containers/App/actions';
import GoogleLogin from 'react-google-login';
import { hasInstalledExtension } from 'utils/chrome';
import { isLogin, logout } from 'utils/simpleAuth';
import { makeSelectCurrentUser } from 'containers/App/selectors';

function AppHeader({ breadcrumb, friends, onGoogleSuccess, onGoogleFailure, onLogout }) {
  return (
    <Header>
      <LogoIcon />
      <Slogan />
      { breadcrumb && <h3>{breadcrumb}</h3>}
      <div style={{ position: 'absolute', top: '65px', right: '40px' }}>
        {isLogin() && friends && friends.length > 0 && <ShareWithFriends friends={friends} />}
        {
          !isLogin() &&
          <GoogleLogin
            style={{
              width: '130px',
              backgroundColor: '#0b9803',
              color: '#fff',
              paddingTop: '10px',
              paddingBottom: '10px',
              borderRadius: '2px',
              border: '2px solid #000',
              display: hasInstalledExtension() ? '' : 'none',
            }}
            clientId="323116239222-b2n8iffvc5ljb71eoahs1k72ee8ulbd7.apps.googleusercontent.com"
            buttonText="Login..."
            onSuccess={onGoogleSuccess}
            onFailure={onGoogleFailure}
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
  onLogout: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  currentUser: makeSelectCurrentUser(),
});

function mapDispatchToProps(dispatch) {
  return {
    onGoogleSuccess: (response) => {
      dispatch(googleConnect(response));
    },
    onGoogleFailure: (error) => {
      dispatch(googleConnectLoadingError(error));
    },
    onLogout: () => {
      dispatch(logoutUser());
      logout();
    },
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppHeader);
