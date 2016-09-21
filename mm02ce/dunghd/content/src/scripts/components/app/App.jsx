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

class App extends Component {

  constructor(props) {
    super(props);
    console.log('props', props);
    this.state = {
      openShare: false,
    }
    this.onLogin = this.onLogin.bind(this);
    this.openInvite = this.openInvite.bind(this);
    this.closeInvite = this.closeInvite.bind(this);
  }

  openInvite() {
    this.setState({
      openShare: true,
    });
  }

  closeInvite() {
    this.setState({
      openShare: false,
    });
  }

  onLogin() {
    console.log('onLogin');
    this.props.dispatch(checkAuth())
      .then(token => console.log(token))
      .catch(err => console.warn(err));
  }

  render() {
    return (
      <div className="maomao-ext-component">
        <WelcomeModal
          auth={this.props.auth}
          onLogin={this.onLogin}
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
