import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import ToggleDisplay from 'react-toggle-display';
import { WelcomeModal, ShareModal } from '../modal';

require('../../stylesheets/main.scss');

const propTypes = {
  auth: PropTypes.object,
  apiUrl: PropTypes.string,
  clienId: PropTypes.string,
  shareModalIsOpen: PropTypes.bool,
  modalIsOpen: PropTypes.bool,
  dispatch: PropTypes.func,
  onOpenModal: PropTypes.func,
  onCloseModal: PropTypes.func,
  onCloseShareModal: PropTypes.func,
  onLogin: PropTypes.func,
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
    this.props.dispatch(checkAuth())
      .then(token => console.log(token))
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
