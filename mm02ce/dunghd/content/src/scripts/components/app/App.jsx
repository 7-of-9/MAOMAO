import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import ToggleDisplay from 'react-toggle-display';
import { WelcomeModal, ShareModal } from '../modal';

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
    this.onLogin = this.onLogin.bind(this);
    this.onShareModal = this.onShareModal.bind(this);
    this.onCloseShareModal = this.onCloseShareModal.bind(this);
  }

  onShareModal() {
    console.log('onShareModal');
    this.props.dispatch({
      type: 'OPEN_SHARE_MODAL',
    });
  }

  onCloseShareModal() {
    console.log('onCloseShareModal');
    this.props.dispatch({
      type: 'CLOSE_SHARE_MODAL',
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
      <div>
        <WelcomeModal
          auth={this.props.auth}
          modalIsOpen={this.props.shareModalIsOpen} onLogin={this.onLogin}
          onShareModal={this.onShareModal}
          />
        <ToggleDisplay if={this.props.auth.isLogin}>
          <ShareModal
            auth={this.props.auth}
            modalIsOpen={this.props.shareModalIsOpen}
            onCloseModal={this.onCloseShareModal}
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
    shareModalIsOpen: state.share,
  };
};

export default connect(mapStateToProps)(App);
