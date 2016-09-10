import React, { Component, PropTypes } from 'react';
import Mailgun from 'mailgun';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

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
    this.fromEmail = 'dunghd.it@gmail.com';
    this.selectedRow = 'none';
    this.selectRecipient = this.selectRecipient.bind(this);
    this.sendInvitation = this.sendInvitation.bind(this);
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

  /**
   * send invitation to google contact by email
   */
  sendInvitation() {
    this.props.onCloseModal();
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
    // const mailgun = new Mailgun.Mailgun('key-6acu-fqm4j325jes59jc31rq557e83l6');
    // const title = 'This is the subject';
    // const content = 'This is the text';
    // mailgun.sendText(this.fromEmail, this.recipients, title, content,
    //   'noreply@maomao.rocks', {},
    //   (err) => {
    //     if (err) {
    //       console.warn(err);
    //     } else {
    //       console.log('Success');
    //     }
    //   });
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
        <GoogleContact selectRecipient={this.selectRecipient} contacts={this.contacts} token={this.props.auth.accessToken} />
      </Dialog>
    );
  }
}

ShareModal.propTypes = propTypes;
ShareModal.defaultProps = defaultProps;

export default ShareModal;
