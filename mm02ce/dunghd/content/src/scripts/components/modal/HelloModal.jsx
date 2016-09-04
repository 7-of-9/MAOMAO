import React, { PropTypes } from 'react';
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
  modalIsOpen: PropTypes.bool.isRequired,
  onOpenModal: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
};

const defaultProps = {
  modalIsOpen: true,
};

const HelloModal = ({ modalIsOpen, onLogin, onOpenModal, onCloseModal }) => (
  <div>
    <button onClick={onOpenModal}>Open Modal</button>
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={onCloseModal}
      style={customStyles}
      >
      <h2>Connect with Google!</h2>
      <a onClick={onLogin}> Click here to login</a>
    </Modal>
  </div>
);

HelloModal.propTypes = propTypes;
HelloModal.defaultProps = defaultProps;

export default HelloModal;
