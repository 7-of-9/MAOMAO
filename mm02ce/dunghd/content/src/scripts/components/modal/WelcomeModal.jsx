import React, { Component, PropTypes } from 'react';
import ToggleDisplay from 'react-toggle-display';
import RaisedButton from 'material-ui/RaisedButton';

import Paper from 'material-ui/Paper';

const customStyles = {
  overlay: {
    zIndex: 9999,
    position: 'fixed',
    top: '0px',
    left: '0px',
    right: '0px',
    bottom: '0px',
    backgroundColor: 'transparent',
  },
  content: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    padding: '20px',
    backgroundColor: '#fff',
    border: '1px solid rgb(204, 204, 204)',
    overlay: 'auto',
    borderRadius: '4px',
    outline: 'none',
  },
};

const propTypes = {
  auth: PropTypes.object,
  modalIsOpen: PropTypes.bool.isRequired,
  onShareModal: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
};

const defaultProps = {
  modalIsOpen: false,
  auth: {
    isLogin: false,
    accessToken: '',
    info: {},
  },
};

class WelcomeModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hidden: false,
    };
    this.onClose = this.onClose.bind(this);
  }

  onClose() {
    this.setState({
      hidden: true,
    });
  }

  render() {
    return (
      <ToggleDisplay hide={this.props.modalIsOpen || this.state.hidden}>
        <div style={customStyles.overlay}>
          <Paper style={customStyles.content} zDepth={3}>
            <h2>Connect with Google!</h2>
            <ToggleDisplay hide={this.props.auth.isLogin}>
              <RaisedButton onTouchTap={this.props.onLogin} label="Login" />
              <RaisedButton onTouchTap={this.onClose} label="Close" />
            </ToggleDisplay>
            <ToggleDisplay show={this.props.auth.isLogin}>
              <p>Welcome back {this.props.auth.info.email}</p>
              <RaisedButton onTouchTap={this.props.onShareModal} label="Invite" />
              <RaisedButton onTouchTap={this.onClose} label="Close" />
            </ToggleDisplay>
          </Paper>
        </div>
      </ToggleDisplay>
    );
  }
}

WelcomeModal.propTypes = propTypes;
WelcomeModal.defaultProps = defaultProps;

export default WelcomeModal;
