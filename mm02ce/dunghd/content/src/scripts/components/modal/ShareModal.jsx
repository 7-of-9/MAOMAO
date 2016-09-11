import React, { Component, PropTypes } from 'react';
import Mailgun from 'mailgun';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Snackbar from 'material-ui/Snackbar';

import GoogleContact from '../google';
import fetchContacts from '../utils/GoogleContactAPI';

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
  constructor(props) {
    super(props);
    this.state = {
      autoHideDuration: 4000,
      message: '',
      open: false,
    };
    this.fromEmail = this.props.auth.info.email;
    this.selectedRow = 'none';
    this.selectRecipient = this.selectRecipient.bind(this);
    this.sendInvitation = this.sendInvitation.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
  }

  componentDidMount() {
    fetchContacts(this.props.auth.accessToken, { limit: 50 })
      .then(result => {
        this.contacts = result.data;
        console.log('contacts is ready', result);
      })
      .catch(err => console.warn(err));
  }

  /**
   * send invitation to google contact by email
   */
  selectRecipient(selectedRow) {
    this.selectedRow = selectedRow;
    console.log('selectedRow', this.selectedRow);
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  /**
   * send invitation to google contact by email
   */
  sendInvitation() {
    let recipients = [];
    if (this.selectedRow === 'all') {
      recipients = [].concat(this.contacts.map(item => item.email));
    } else {
      recipients = [].concat(this.contacts
        .filter((item, index) => this.selectedRow.indexOf(index) !== -1)
        .map(item => item.email)
      );
    }
    console.log('sendInvitation', recipients);
    if (recipients.length) {
      this.props.onCloseModal();
      const mailgun = new Mailgun.Mailgun('key-6acu-fqm4j325jes59jc31rq557e83l6');
      const title = 'Welcome to mamao extension!';
      const content = JSON.stringify(recipients, null, 2);
      mailgun.sendText(this.fromEmail,
        ['dung@maomao.rocks', 'dom@maomao.rocks'],
        title,
        content,
        'noreply@maomao.rocks', {},
        (err) => {
          if (err) {
            console.warn(err);
          } else {
            console.log('Email has been sent!');
            this.setState({
              open: true,
              message: 'Email has been sent!',
            });
          }
        });
    } else {
      this.setState({
        open: true,
        message: 'Please select at least one contact for sending invitation',
      });
    }
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary
        onTouchTap={this.props.onCloseModal}
        />,
      <FlatButton
        label="Send"
        primary
        keyboardFocused
        onTouchTap={this.sendInvitation}
        />,
    ];

    return (
      <Dialog
        title="Invite your friends!"
        actions={actions}
        open={this.props.modalIsOpen}
        onRequestClose={this.props.onCloseModal}
        autoScrollBodyContent
        >
        <GoogleContact
          selectRecipient={this.selectRecipient}
          contacts={this.contacts}
          token={this.props.auth.accessToken}
          />
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={this.state.autoHideDuration}
          onRequestClose={this.handleRequestClose}
          />
      </Dialog>
    );
  }
}

ShareModal.propTypes = propTypes;
ShareModal.defaultProps = defaultProps;

export default ShareModal;
