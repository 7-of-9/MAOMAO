import React, { PropTypes } from 'react';
import ToggleDisplay from 'react-toggle-display';
import Modal from 'react-modal';

const customStyles = {
  content: {
    top: '30%',
    left: '70%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
  },
};

const propTypes = {
  auth: PropTypes.object,
  modalIsOpen: PropTypes.bool.isRequired,
  onOpenModal: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
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

const HelloModal = ({ auth, modalIsOpen, onLogin, onOpenModal, onCloseModal }) => (
  <div>
    <button onClick={onOpenModal}>Open Modal</button>
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={onCloseModal}
      style={customStyles}
      >
      <h2>Connect with Google!</h2>
      <ToggleDisplay hide={auth.isLogin}>
        <p><a onClick={onLogin}> Click here to login</a></p>
      </ToggleDisplay>
      <ToggleDisplay show={auth.isLogin}>
        <p>Welcome back {auth.info.email}</p>
      </ToggleDisplay>
    </Modal>
  </div>
);

HelloModal.propTypes = propTypes;
HelloModal.defaultProps = defaultProps;

export default HelloModal;
