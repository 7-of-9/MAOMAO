import React, { Component, PropTypes } from 'react';
import Mailgun from 'mailgun';

import GoogleContactPresenter from './GoogleContactPresenter';

class GoogleContact extends Component {
  constructor(props) {
    super(props);
    this.fromEmail = 'dunghd.it@gmail.com';
    this.emails = [];
    this.recipients = [];
    this.sendInvitation = this.sendInvitation.bind(this);
    this.renderContact = this.renderContact.bind(this);
    this.selectAddress = this.selectAddress.bind(this);
  }

  selectAddress(email) {
    const pos = this.emails.indexOf(email);
    if (pos === -1) {
      this.emails.push(email);
    } else {
      this.emails.splice(pos, 1);
    }
    console.log('Select emails', this.emails);
  }

  /**
   * send invitation to google contact by email
   */
  sendInvitation() {
    if (this.recipients.length) {
      const mailgun = new Mailgun.Mailgun('key-6acu-fqm4j325jes59jc31rq557e83l6');
      const title = 'This is the subject';
      const content = 'This is the text';
      mailgun.sendText(this.fromEmail, this.recipients, title, content,
        'noreply@maomao.rocks', {},
        (err) => {
          if (err) {
            console.warn(err);
          } else {
            console.log('Success');
          }
        });
    }
  }

  renderContact(contact) {
    return (
      <li key={contact.key}>
        <GoogleContactPresenter
          email={contact.email}
          name={contact.name}
          selectAddress={this.selectAddress}
          />
      </li>
    );
  }

  render() {
    return (
      <div>
        <h3> Please select your friends to send invitation!</h3>
        <ul className="contact-list">
          {this.props.contacts.map(this.renderContact) }
        </ul>
        <button onClick={this.sendInvitation}>Send</button>
      </div>
    );
  }
}

GoogleContact.propTypes = {
  token: PropTypes.string.isRequired,
  contacts: PropTypes.array.isRequired,
};

GoogleContact.defaultProps = {
  contacts: [],
};

export default GoogleContact;
