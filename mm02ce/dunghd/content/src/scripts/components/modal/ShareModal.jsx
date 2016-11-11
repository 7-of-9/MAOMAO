import React, { Component, PropTypes } from 'react';
import Mailgun from 'mailgun';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Snackbar from 'material-ui/Snackbar';

import GoogleContact from '../google';
import fetchContacts from '../utils/GoogleContactAPI';

const propTypes = {
  auth: PropTypes.object,
  siteUrl: PropTypes.string,
  mailgunKey: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onCloseModal: PropTypes.func.isRequired,
};

const defaultProps = {
  auth: {
    isLogin: false,
    accessToken: '',
    info: {},
  },
};

const customStyles = {
  title: {
    textAlign: 'center',
    margin: ' 0px 0px -1px',
    padding: '24px 24px 20px',
    color: 'rgba(0, 0, 0, 0.870588)',
    fontSize: '22px',
    lineHeight: '32px',
    fontWeight: '400',
    borderBottom: '1px solid rgb(224, 224, 224)',
  },
};

class ShareModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      autoHideDuration: 4000,
      message: '',
      contacts: [],
      page: 1,
      open: false,
      hasMore: true,
    };
    this.fromEmail = this.props.auth.info.email;
    this.selectedRow = 'none';
    this.selectRecipient = this.selectRecipient.bind(this);
    this.sendInvitation = this.sendInvitation.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.loadPage = this.loadPage.bind(this);
  }

  componentDidMount() {
    this.loadPage(this.state.page);
  }

  onCloseModal() {
    this.props.onCloseModal();
  }

  loadPage(page) {
    const limit = 50;
    fetchContacts(this.props.auth.accessToken, { limit, page })
      .then(result => {
        const contacts = this.state.contacts.concat(result.data);
        this.setState({
          contacts,
          page: Number(result.page),
        });
        console.log('contacts is ready', result);
        if (result.total < Number(result.page * limit)) {
          this.setState({
            hasMore: false,
          });
        }
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
      recipients = [].concat(this.state.contacts.map(item => item.email));
    } else {
      recipients = [].concat(this.state.contacts
        .filter((item, index) => this.selectedRow.indexOf(index) !== -1)
        .map(item => item.email)
      );
    }
    console.log('sendInvitation', recipients);
    if (recipients.length) {
      this.props.onCloseModal();
      const mailgun = new Mailgun.Mailgun(this.props.mailgunKey);
      const title = 'Welcome to mamao extension!';
      const content = `Hi, this is awesome extention. Click on ${this.props.siteUrl} to check it out now.`;
      mailgun.sendText(this.fromEmail,
        recipients,
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
        title={`Invite your friends - ${this.fromEmail}!`}
        actions={actions}
        titleStyle={customStyles.title}
        open={this.props.isOpen}
        onRequestClose={this.onCloseModal}
        autoScrollBodyContent
        >
        <GoogleContact
          selectRecipient={this.selectRecipient}
          contacts={this.state.contacts}
          hasMore={this.state.hasMore}
          loadMore={this.loadPage}
          page={this.state.page}
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
