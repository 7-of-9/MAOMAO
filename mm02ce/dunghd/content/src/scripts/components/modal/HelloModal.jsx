import React, { PropTypes } from 'react';
import ToggleDisplay from 'react-toggle-display';
import Modal from 'react-modal';

const customStyles = {
  content: {
    top: '20%',
    left: '80%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
  },
};

const propTypes = {
  auth: PropTypes.object,
  modalIsOpen: PropTypes.bool.isRequired,
  onShareModal: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
};

const defaultProps = {
  modalIsOpen: true,
  auth: {
    isLogin: false,
    accessToken: '',
    info: {},
  },
};

const HelloModal = ({ auth, modalIsOpen, onLogin, onShareModal, onClose }) => (
  <div>
    <Modal
      isOpen={modalIsOpen}
      style={customStyles}
      >
      <h2>Connect with Google!</h2>
      <ToggleDisplay hide={auth.isLogin}>
        <p><a onClick={onLogin}> Click here to login</a></p>
      </ToggleDisplay>
      <ToggleDisplay show={auth.isLogin}>
        <p>Welcome back {auth.info.email}</p>
        <p><a onClick={onShareModal}> Share with your friends</a></p>
      </ToggleDisplay>
      <p><a onClick={onClose}>Close</a></p>
    </Modal>
  </div>
);

HelloModal.propTypes = propTypes;
HelloModal.defaultProps = defaultProps;

export default HelloModal;
