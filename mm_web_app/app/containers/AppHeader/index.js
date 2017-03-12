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
import GoogleLogin from 'react-google-login';
import { hasInstalledExtension } from 'utils/chrome';
import { isLogin, logout } from 'utils/simpleAuth';

import {
   googleConnect, googleConnectLoadingError,
} from '../App/actions';
import {
   makeSelectCurrentUser,
} from '../App/selectors';

export class AppHeader extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <Header>
        <LogoIcon />
        <Slogan />
        { this.props.breadcrumb && <h3>{this.props.breadcrumb}</h3>}
        <div style={{ position: 'absolute', top: '65px', right: '40px' }}>
          {this.props.friends && this.props.friends.length > 0 && <ShareWithFriends friends={this.props.friends} />}
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
              onSuccess={this.props.onGoogleSuccess}
              onFailure={this.props.onGoogleFailure}
            />
        }
          {isLogin() && <Logout
            onLogout={() => {
              logout();
              window.location.href = '/';
            }}
          /> }
          <DiscoveryButton />
        </div>
      </Header>
    );
  }
}

AppHeader.propTypes = {
  breadcrumb: PropTypes.string,
  friends: PropTypes.array.isRequired,
  onGoogleSuccess: PropTypes.func.isRequired,
  onGoogleFailure: PropTypes.func.isRequired,
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
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppHeader);
