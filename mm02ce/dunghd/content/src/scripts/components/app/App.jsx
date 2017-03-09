import React, { Component, PropTypes } from 'react';
import { StyleRoot } from 'radium';
import { connect } from 'react-redux';
import ToggleDisplay from 'react-toggle-display';
import ReactMaterialUiNotifications from 'react-materialui-notifications';
import moment from 'moment';
import Mailgun from 'mailgun';
import $ from 'jquery';
import { deepOrange500 } from 'material-ui/styles/colors';
import Message from 'material-ui/svg-icons/communication/message';
import ErrorOutline from 'material-ui/svg-icons/alert/error-outline';

import { WelcomeModal } from '../modal';
import Score from './Score';
import ShareTopic from './ShareTopic';
import Xp from './Xp';
import createUser from '../utils/UserApi';
import getCurrentTerms from '../../selectors/term';

window.jQuery = $;

require('../../stylesheets/animate.min.css');
require('../../stylesheets/main.scss');
require('../../vendors/jquery.fittext');
require('../../vendors/jquery.lettering');
require('../../vendors/jquery.textillate');

const propTypes = {
  auth: PropTypes.object,
  score: PropTypes.object,
  icon: PropTypes.object,
  terms: PropTypes.array,
  isOpen: PropTypes.bool.isRequired,
  siteUrl: PropTypes.string,
  mailgunKey: PropTypes.string,
  apiUrl: PropTypes.string,
  dispatch: PropTypes.func,
};

const defaultProps = {
  auth: {
    isLogin: false,
    accessToken: '',
    info: {},
    contacts: [],
  },
  score: {
    isOpen: false,
    im_score: 0,
  },
  icon: {
    xp: {
      score: 0,
      topic: '',
    },
  },
  terms: [],
  isShareOpen: false,
  isOpen: false,
  siteUrl: '',
  apiUrl: '',
  mailgunKey: '',
  dispatch: () => { },
};

const checkAuth = () => {
  const data = {
    type: 'AUTH_LOGIN',
    payload: {},
  };
  return data;
};

const fetchContacts = () => {
  const data = {
    type: 'FETCH_CONTACTS',
    payload: {},
  };
  return data;
};

const logout = () => {
  const data = {
    type: 'AUTH_LOGOUT',
    payload: {},
  };
  return data;
};

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      openShare: false, // hide on loading, trigger show login by ctx
    };
    this.onClose = this.onClose.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.openInvite = this.openInvite.bind(this);
    this.closeInvite = this.closeInvite.bind(this);
    this.sendEmail = this.sendEmail.bind(this);
    this.notify = this.notify.bind(this);

    this.mailgun = new Mailgun.Mailgun(this.props.mailgunKey);
  }

  onLogin() {
    this.notify({
      title: 'Prepare to login!',
      autoHide: 1000,
      timestamp: moment().format('h:mm A'),
    });
    this.props.dispatch(checkAuth())
      .then((token) => {
        if (token) {
          this.props.dispatch(fetchContacts());
          return createUser(`${this.props.apiUrl}/users/google`, {
            email: token.info.email,
            firstName: token.info.family_name,
            lastName: token.info.given_name,
            avatar: token.info.picture,
            gender: token.info.gender,
            google_user_id: token.info.sub,
          });
        }
        throw new Error(this.props.auth.message);
      })
      .then((user) => {
        let userId = -1;
        if (user.data && user.data.id) {
          userId = user.data.id;
        }
        this.props.dispatch({
          type: 'USER_AFTER_LOGIN',
          payload: {
            userId,
          },
        });
      })
      .catch((err) => {
        this.notify({
          title: err.message,
          autoHide: 3000,
          timestamp: moment().format('h:mm A'),
        });
      });
  }

  onClose() {
    this.props.dispatch({
      type: 'CLOSE_MODAL',
    });
  }

  onLogout() {
    this.props.dispatch(logout());
  }

  notify(msg) {
    ReactMaterialUiNotifications.showNotification(msg);
    this.forceUpdate();
  }

  closeInvite() {
    this.setState({
      openShare: false,
    });
  }

  openInvite() {
    this.setState({
      openShare: true,
    });
  }

  sendEmail(name, email, topic) {
    this.fromEmail = this.props.auth.info.email;
    this.userId = this.props.auth.userId;
    this.fullName = this.props.auth.info.name;
    this.title = `Join Maomao! ${this.fullName} want to share with you...`;

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
                  <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">${this.fullName} would like to share the MaoMao stream with you: <strong>${topic}.</span>
                  <table class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #fff; border-radius: 3px;" width="100%">

                    <!-- START MAIN CONTENT AREA -->
                    <tr>
                      <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                        <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                          <tr><td style="font-family: 'Rokkitt', sans-serif; vertical-align: top;" valign="top"><h1> Maomao </h1></td></tr>
                          <tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top"> <img src="https://maomaoweb.azurewebsites.net/images/logo.png" /> </td></tr>
                          <tr>
                            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                              <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Hi ${name || 'there'},</p>
                              <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">${this.fullName} would like to share the MaoMao stream with you: <strong>${topic}.</p>
                              <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Click <a href="${this.props.siteUrl}?from=${encodeURI(this.fullName)}&email=${encodeURI(this.fromEmail)}&ref=${this.userId}&stream=${encodeURI(topic)}" target="_blank">here</a> to unlock ${this.fullName}'s stream - you'll get to see his best picks in this stream on your Maomao homepage!</p>
                              <table border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; box-sizing: border-box;" width="100%">
                                <tbody>
                                  <tr>
                                    <td align="left" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" valign="top">
                                      <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                                        <tbody>
                                          <tr>
                                            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; background-color: #3498db; border-radius: 5px; text-align: center;" valign="top" bgcolor="#3498db" align="center"><a href="${this.props.siteUrl}?from=${encodeURI(this.fullName)}&email=${encodeURI(this.fromEmail)}&ref=${this.userId}&stream=${encodeURI(topic)}" target="_blank" style="display: inline-block; color: #ffffff; background-color: #3498db; border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-transform: capitalize; border-color: #3498db;">Unlock Now!</a></td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Kind regards, <br/> Maomao Team</p> <br/> www.maomao.rocks</p>
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
          this.notify({
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
          this.notify({
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

  render() {
    return (
      <StyleRoot>
        <div className="maomao-ext-component">
          <ReactMaterialUiNotifications
            rootStyle={{
              zIndex: 10000,
              top: 20,
              right: 25,
            }}
            desktop
            transitionAppear={false}
            transitionLeave={false}
          />
          <WelcomeModal
            auth={this.props.auth}
            onLogin={this.onLogin}
            onClose={this.onClose}
            onLogout={this.onLogout}
            openInvite={this.openInvite}
            isShareOpen={this.state.openShare}
            isOpen={this.props.isOpen}
          />
          <ShareTopic
            enable={this.state.openShare}
            terms={this.props.terms}
            sendEmail={this.sendEmail}
            contacts={this.props.auth && this.props.auth.contacts}
            notify={this.notify}
          />
          <ToggleDisplay
            if={
              this.props.auth.isLogin
              && this.props.score.isOpen
              && this.props.score.im_score > 0
              && this.props.icon.isEnableIM
            }
          >
            <Score imscoreByUrl={this.imscoreByUrl} score={this.props.score} />
          </ToggleDisplay>
          <Xp terms={this.props.terms} shareTopics={this.openInvite} />
        </div>
      </StyleRoot>
    );
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

const mapStateToProps = state => ({
  auth: state.auth,
  isOpen: state.modal,
  score: state.score,
  terms: getCurrentTerms(state),
  icon: state.icon,
});

export default connect(mapStateToProps)(App);
