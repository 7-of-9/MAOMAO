import React, { Component, PropTypes } from 'react';
import Mailgun from 'mailgun';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { deepOrange500 } from 'material-ui/styles/colors';
import ReactMaterialUiNotifications from 'react-materialui-notifications';
import Message from 'material-ui/svg-icons/communication/message';
import ErrorOutline from 'material-ui/svg-icons/alert/error-outline';
import moment from 'moment';

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
  content: {
    transform: 'none',
  },
};

class ShareModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contacts: [],
      page: 1,
      totalPages: 0,
    };
    this.fromEmail = this.props.auth.info.email;
    this.fullName = this.props.auth.info.name;
    this.recipients = [];
    this.selectRecipient = this.selectRecipient.bind(this);
    this.sendInvitation = this.sendInvitation.bind(this);
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
    const limit = 5000;
    fetchContacts(this.props.auth.accessToken, { limit, page })
      .then(result => {
        const contacts = result.data.map((item) => {
          const object = {
            name: `${item.name} (${item.email})`,
            email: item.email,
          };
          return object;
        }) || [];
        this.setState({
          contacts,
          page: Number(result.page),
          totalPages: Math.ceil(result.total / limit),
        });
        console.log('contacts is ready', result);
      })
      .catch(err => console.warn(err));
  }

  /**
   * send invitation to google contact by email
   */
  selectRecipient(recipients) {
    console.log('selectRecipient', recipients);
    this.recipients = recipients;
  }

  /**
   * send invitation to google contact by email
   */
  sendInvitation() {
    console.log('sendInvitation', this.recipients);
    if (this.recipients.length) {
      const mailgun = new Mailgun.Mailgun(this.props.mailgunKey);
      const title = 'Welcome to mamao extension!';
      const content = `Hi, this is awesome extention. Click on ${this.props.siteUrl}?from=${encodeURI(this.fullName)}&email=${encodeURI(this.fromEmail)} to check it out now.`;
      mailgun.sendText(this.fromEmail,
        this.recipients,
        title,
        content,
        'noreply@maomao.rocks', {},
        (err) => {
          if (err) {
            ReactMaterialUiNotifications.showNotification({
              title: 'Error!',
              icon: <ErrorOutline />,
              iconBadgeColor: deepOrange500,
              additionalText: err.message,
              overflowText: this.fromEmail,
              avatar: this.props.auth.info.picture,
              personalised: true,
              autoHide: 2000,
              timestamp: moment().format('h:mm A'),
            });
          } else {
            ReactMaterialUiNotifications.showNotification({
              title: 'Sending invitation!',
              icon: <Message />,
              iconBadgeColor: deepOrange500,
              additionalText: `Email has been sent to ${this.recipients.join(',')}`,
              overflowText: this.fromEmail,
              avatar: this.props.auth.info.picture,
              personalised: true,
              autoHide: 2000,
              timestamp: moment().format('h:mm A'),
            });
          }
          this.recipients = [];
          this.props.onCloseModal();
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
        contentStyle={customStyles.content}
        open={this.props.isOpen}
        onRequestClose={this.onCloseModal}
        autoScrollBodyContent
        >
        <GoogleContact
          selectRecipient={this.selectRecipient}
          contacts={this.state.contacts}
          />
      </Dialog>
    );
  }
}

ShareModal.propTypes = propTypes;
ShareModal.defaultProps = defaultProps;

export default ShareModal;
