import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import ToggleDisplay from 'react-toggle-display';
import ReactMaterialUiNotifications from 'react-materialui-notifications';
import moment from 'moment';
import $ from 'jquery';
window.jQuery = $;

import { WelcomeModal, ShareModal } from '../modal';
import createUser from '../utils/UserApi';

require('../../stylesheets/animate.min.css');
require('../../stylesheets/main.scss');
require('../../vendors/jquery.lettering.js');
require('../../vendors/jquery.textillate.js');

const propTypes = {
  auth: PropTypes.object,
  siteUrl: PropTypes.string,
  mailgunKey: PropTypes.string,
  apiUrl: PropTypes.string,
  googleApiKey: PropTypes.string,
  clientId: PropTypes.string,
  webClientId: PropTypes.string,
  dispatch: PropTypes.func,
};

const checkAuth = () => {
  const data = {
    type: 'AUTH_LOGIN',
    payload: {},
  };
  return data;
};

const logout = () => {
  const data = {
    type: 'AUTH_LOGOUT',
    payload: {},
  };
  return data;
};

class App extends Component {

  constructor(props) {
    super(props);
    console.log('props', props);
    this.state = {
      openShare: false,
    };
    this.onLogin = this.onLogin.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.openInvite = this.openInvite.bind(this);
    this.closeInvite = this.closeInvite.bind(this);
  }

  onLogin() {
    console.log('onLogin');
    ReactMaterialUiNotifications.showNotification({
      title: 'Prepare to login!',
      autoHide: 1000,
      timestamp: moment().format('h:mm A'),
    });
    this.props.dispatch(checkAuth())
      .then(token => {
        console.log('token', token);
        return createUser(`${this.props.apiUrl}/users/google`, {
          email: token.info.email,
          firstName: token.info.family_name,
          lastName: token.info.given_name,
          avatar: token.info.picture,
          gender: token.info.gender,
          google_user_id: token.info.sub,
        });
      })
      .then(user => console.log('user', user))
      .catch(err => console.warn(err));
  }

  onLogout() {
    console.log('onLogout');
    this.props.dispatch(logout())
      .then(token => console.log(token))
      .catch(err => console.warn(err));
  }

  closeInvite() {
    this.setState({
      openShare: false,
    });
  }

  openInvite() {
    this.setState({
      openShare: true,
    });
  }

  render() {
    return (
      <div className="maomao-ext-component">
        <ReactMaterialUiNotifications
          rootStyle={{
            zIndex: 10000,
            top: 20,
            right: 25,
          }}
          desktop
          transitionAppear={false}
          transitionLeave={false}
          />
        <WelcomeModal
          auth={this.props.auth}
          onLogin={this.onLogin}
          onLogout={this.onLogout}
          openInvite={this.openInvite}
          isShareOpen={this.state.openShare}
          />
        <ToggleDisplay if={this.props.auth.isLogin}>
          <ShareModal
            auth={this.props.auth}
            mailgunKey={this.props.mailgunKey}
            siteUrl={this.props.siteUrl}
            isOpen={this.state.openShare}
            onCloseModal={this.closeInvite}
            />
        </ToggleDisplay>
      </div>
    );
  }
}

App.propTypes = propTypes;

const mapStateToProps = (state) => {
  console.log('state', state);
  return {
    auth: state.auth,
  };
};

export default connect(mapStateToProps)(App);
