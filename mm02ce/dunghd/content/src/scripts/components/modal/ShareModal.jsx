import React, { Component, PropTypes } from 'react';
import Modal from 'react-modal';

import GoogleContact from '../google';
import fetchContacts from '../utils/GoogleContactAPI';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
  },
};

const propTypes = {
  auth: PropTypes.object,
  modalIsOpen: PropTypes.bool.isRequired,
  onCloseModal: PropTypes.func.isRequired,
};

const defaultProps = {
  modalIsOpen: true,
  auth: {
    isLogin: false,
    accessToken: '',
    info: {},
  },
};


class ShareModal extends Component {

  componentDidMount() {
    fetchContacts(this.props.auth.accessToken, { limit: 100 })
      .then(data => {
        this.contacts = data;
        console.log('contacts is ready', data);
      })
      .catch(err => console.warn(err));
  }

  render() {
    return (
      <div>
        <Modal
          isOpen={this.props.modalIsOpen}
          onRequestClose={this.props.onCloseModal}
          style={customStyles}
          >
          <GoogleContact contacts={this.contacts} token={this.props.auth.accessToken} />
        </Modal>
      </div>
    );
  }
}

ShareModal.propTypes = propTypes;
ShareModal.defaultProps = defaultProps;

export default ShareModal;
