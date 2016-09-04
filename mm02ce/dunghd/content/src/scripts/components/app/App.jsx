import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import HelloModal from '../modal';

const propTypes = {
  auth: PropTypes.object,
  apiUrl: PropTypes.string,
  clienId: PropTypes.string,
  modalIsOpen: PropTypes.bool,
  dispatch: PropTypes.func,
  onOpenModal: PropTypes.func,
  onCloseModal: PropTypes.func,
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
    this.onOpenModal = this.onOpenModal.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
  }

  onOpenModal() {
    console.log('onOpenModal');
    this.props.dispatch({
      type: 'OPEN_MODAL',
    });
  }

  onCloseModal() {
    console.log('onCloseModal');
    this.props.dispatch({
      type: 'CLOSE_MODAL',
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
        <HelloModal
          auth={this.props.auth}
          modalIsOpen={this.props.modalIsOpen} onLogin={this.onLogin}
          onOpenModal={this.onOpenModal} onCloseModal={this.onCloseModal}
          />
      </div>
    );
  }
}

App.propTypes = propTypes;

const mapStateToProps = (state) => {
  console.log('state', state);
  return {
    auth: state.auth,
    modalIsOpen: state.modal,
  };
};

export default connect(mapStateToProps)(App);
