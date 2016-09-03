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
  dispatch: PropTypes.func,
  onOpenModal: PropTypes.func,
  onCloseModal: PropTypes.func,
};

const defaultProps = {
  modalIsOpen: true,
};

const HelloModal = ({ onOpenModal, onCloseModal, modalIsOpen }) => (
  <div>
    <button onClick={onOpenModal}>Open Modal</button>
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={onCloseModal}
      style={customStyles}
      >
      <h2>Hello Maomao!</h2>
      <button onClick={onCloseModal}>close</button>
      <div>I am a modal</div>
    </Modal>
  </div>
);

HelloModal.propTypes = propTypes;
HelloModal.defaultProps = defaultProps;

export default HelloModal;
