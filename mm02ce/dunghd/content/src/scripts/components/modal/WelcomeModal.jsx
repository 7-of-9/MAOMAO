import React, { PropTypes } from 'react';
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
    top: '150px',
    right: '20px',
    left: 'auto',
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

const WelcomeModal = ({ auth, modalIsOpen, onLogin, onShareModal }) => (
  <ToggleDisplay hide={modalIsOpen}>
    <div style={customStyles.overlay}>
      <Paper style={customStyles.content} zDepth={3}>
        <h2>Connect with Google!</h2>
        <ToggleDisplay hide={auth.isLogin}>
          <RaisedButton onTouchTap={onLogin} label="Login" />
        </ToggleDisplay>
        <ToggleDisplay show={auth.isLogin}>
          <p>Welcome back {auth.info.email}</p>
          <RaisedButton onTouchTap={onShareModal} label="Invite" />
        </ToggleDisplay>
      </Paper>
    </div>
  </ToggleDisplay>
);

WelcomeModal.propTypes = propTypes;
WelcomeModal.defaultProps = defaultProps;

export default WelcomeModal;
