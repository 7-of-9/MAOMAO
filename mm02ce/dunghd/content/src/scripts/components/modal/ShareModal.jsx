import React, { Component, PropTypes } from 'react';
import Mailgun from 'mailgun';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { deepOrange500 } from 'material-ui/styles/colors';
import Message from 'material-ui/svg-icons/communication/message';
import ErrorOutline from 'material-ui/svg-icons/alert/error-outline';
import moment from 'moment';
import $ from 'jquery';

import fetchContacts from '../utils/GoogleContactAPI';

const propTypes = {
  auth: PropTypes.object,
  siteUrl: PropTypes.string,
  mailgunKey: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  notify: PropTypes.func.isRequired,
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
  animateText: {
    color: '#999',
    fontFamily: 'Rokkitt',
    fontSize: '75px',
    textShadow: '0.025em 0.025em 0.025em rgba(0, 0, 0, 0.8)',
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
    this.mailgun = new Mailgun.Mailgun(this.props.mailgunKey);
    this.fromEmail = this.props.auth.info.email;
    this.fullName = this.props.auth.info.name;
    this.recipients = [];
    this.selectRecipient = this.selectRecipient.bind(this);
    this.changeSubject = this.changeSubject.bind(this);
    this.sendInvitation = this.sendInvitation.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.loadPage = this.loadPage.bind(this);
    this.sendEmail = this.sendEmail.bind(this);
  }

  componentDidMount() {
    this.loadPage(this.state.page);
    $('.tlt').fitText(0.5).textillate();
  }

  onCloseModal() {
    this.props.onCloseModal();
  }

  loadPage(page) {
    const limit = 5000;
    fetchContacts(this.props.auth.accessToken, { limit, page })
      .then((result) => {
        const contacts = result.data.map((item) => {
          const object = {
            text: `${item.name} (${item.email})`,
            name: item.name,
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
  changeSubject(subject) {
    this.title = subject;
  }


  sendEmail(name, email) {
    const emailTemplate = `
      <!doctype html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width">
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <title>MaoMao Extension</title>
          <link href='https://fonts.googleapis.com/css?family=Rokkitt' rel='stylesheet' type='text/css'>
          <style media="all" type="text/css">
          @media all {
            .btn-primary table td:hover {
              background-color: #34495e !important;
            }
            .btn-primary a:hover {
              background-color: #34495e !important;
              border-color: #34495e !important;
            }
          }

          @media all {
            .btn-secondary a:hover {
              border-color: #34495e !important;
              color: #34495e !important;
            }
          }

          @media only screen and (max-width: 620px) {
            table[class=body] h1 {
              font-size: 28px !important;
              margin-bottom: 10px !important;
            }
            table[class=body] h2 {
              font-size: 22px !important;
              margin-bottom: 10px !important;
            }
            table[class=body] h3 {
              font-size: 16px !important;
              margin-bottom: 10px !important;
            }
            table[class=body] p,
            table[class=body] ul,
            table[class=body] ol,
            table[class=body] td,
            table[class=body] span,
            table[class=body] a {
              font-size: 16px !important;
            }
            table[class=body] .wrapper,
            table[class=body] .article {
              padding: 10px !important;
            }
            table[class=body] .content {
              padding: 0 !important;
            }
            table[class=body] .container {
              padding: 0 !important;
              width: 100% !important;
            }
            table[class=body] .header {
              margin-bottom: 10px !important;
            }
            table[class=body] .main {
              border-left-width: 0 !important;
              border-radius: 0 !important;
              border-right-width: 0 !important;
            }
            table[class=body] .btn table {
              width: 100% !important;
            }
            table[class=body] .btn a {
              width: 100% !important;
            }
            table[class=body] .img-responsive {
              height: auto !important;
              max-width: 100% !important;
              width: auto !important;
            }
            table[class=body] .alert td {
              border-radius: 0 !important;
              padding: 10px !important;
            }
            table[class=body] .span-2,
            table[class=body] .span-3 {
              max-width: none !important;
              width: 100% !important;
            }
            table[class=body] .receipt {
              width: 100% !important;
            }
          }

          @media all {
            .ExternalClass {
              width: 100%;
            }
            .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass font,
            .ExternalClass td,
            .ExternalClass div {
              line-height: 100%;
            }
            .apple-link a {
              color: inherit !important;
              font-family: inherit !important;
              font-size: inherit !important;
              font-weight: inherit !important;
              line-height: inherit !important;
              text-decoration: none !important;
            }
          }
          </style>
        </head>
        <body class="" style="font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #f6f6f6; margin: 0; padding: 0;">
          <table border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background-color: #f6f6f6;" width="100%" bgcolor="#f6f6f6">
            <tr>
              <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
              <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; Margin: 0 auto !important; max-width: 580px; padding: 10px; width: 580px;" width="580" valign="top">
                <div class="content" style="box-sizing: border-box; display: block; Margin: 0 auto; max-width: 580px; padding: 10px;">

                  <!-- START CENTERED WHITE CONTAINER -->
                  <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">${this.fullName} has invited you to view their stream on MaoMao.</span>
                  <table class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #fff; border-radius: 3px;" width="100%">

                    <!-- START MAIN CONTENT AREA -->
                    <tr>
                      <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                        <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                          <tr><td style="font-family: 'Rokkitt', sans-serif; vertical-align: top;" valign="top"><h1> Maomao </h1></td></tr>
                          <tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top"> <img src="https://maomaoweb.azurewebsites.net/images/logo.png" /> </td></tr>
                          <tr>
                            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                              <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Hi ${name},</p>
                              <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">${this.fullName} would like to live-share the MaoMao stream with you.</p>
                              <table border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; box-sizing: border-box;" width="100%">
                                <tbody>
                                  <tr>
                                    <td align="left" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" valign="top">
                                      <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                                        <tbody>
                                          <tr>
                                            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; background-color: #3498db; border-radius: 5px; text-align: center;" valign="top" bgcolor="#3498db" align="center"> <a href="${this.props.siteUrl}?from=${encodeURI(this.fullName)}&email=${encodeURI(this.fromEmail)}" target="_blank" style="display: inline-block; color: #ffffff; background-color: #3498db; border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-transform: capitalize; border-color: #3498db;">Get ${this.fullName}'s MaoMao stream...</a> </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Check it out! ${this.fullName} shares this stream just with you. It's free and super easy.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- END MAIN CONTENT AREA -->
                    </table>

                  <!-- START FOOTER -->
                  <div class="footer" style="clear: both; padding-top: 10px; text-align: center; width: 100%;">
                    <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                      <tr>
                        <td class="content-block powered-by" style="font-family: sans-serif; vertical-align: top; padding-top: 10px; padding-bottom: 10px; font-size: 12px; color: #999999; text-align: center;" valign="top" align="center">
                          Powered by <a href="http://maomao.rocks" style="color: #999999; font-size: 12px; text-align: center; text-decoration: none;">MaoMao.rocks</a>.
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- END FOOTER -->

      <!-- END CENTERED WHITE CONTAINER --></div>
              </td>
              <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
            </tr>
          </table>
        </body>
      </html>`;
    const joinEmailAddress = 'join@maomao.rocks';
    this.mailgun.sendRaw(joinEmailAddress,
      email,
      `From: ${joinEmailAddress}
        \nTo: ${email}
        \nContent-Type: text/html; charset=utf-8
        \nSubject: ${this.title}
        \n\n ${emailTemplate}`,
      (err) => {
        if (err) {
          console.warn(err);
          this.props.notify({
            title: `Sending error to ${email}`,
            icon: <ErrorOutline />,
            iconBadgeColor: deepOrange500,
            additionalText: err.message,
            overflowText: this.fromEmail,
            avatar: this.props.auth.info.picture,
            personalised: true,
            autoHide: 2500,
            timestamp: moment().format('h:mm A'),
          });
        } else {
          this.props.notify({
            title: 'Sending invitation!',
            icon: <Message />,
            iconBadgeColor: deepOrange500,
            additionalText: `Email has been sent to ${email}`,
            overflowText: this.fromEmail,
            avatar: this.props.auth.info.picture,
            personalised: true,
            autoHide: 2500,
            timestamp: moment().format('h:mm A'),
          });
        }
      });
  }

  /**
   * send invitation to google contact by email
   */
  sendInvitation() {
    console.log('sendInvitation', this.recipients);
    if (this.recipients.length) {
      // set default subject
      if (!this.title) {
        this.title = `${this.fullName} would like to share the MaoMao stream with you!`;
      }
      this.recipients.forEach((item) => {
        this.sendEmail(item.name, item.email);
      });
      this.recipients = [];
      this.props.onCloseModal();
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
        onTouchTap={this.sendInvitation}
      />,
    ];

    return (
      <Dialog
        modal
        title={`Invite your friends - ${this.fromEmail}!`}
        actions={actions}
        titleStyle={customStyles.title}
        contentStyle={customStyles.content}
        open={this.props.isOpen}
        onRequestClose={this.onCloseModal}
        autoScrollBodyContent
      >
        <div className="maomao-logo" />
        <h1 className="tlt glow in" style={customStyles.animateText}>
          maomao
            </h1>
        <GoogleContact
          from={this.fromEmail}
          subject={`${this.fullName} would like to share the MaoMao stream with you...`}
          selectRecipient={this.selectRecipient}
          changeSubject={this.changeSubject}
          contacts={this.state.contacts}
        />
      </Dialog>
    );
  }
}

ShareModal.propTypes = propTypes;
ShareModal.defaultProps = defaultProps;

export default ShareModal;
