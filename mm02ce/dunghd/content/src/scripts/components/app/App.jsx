import React, { Component, PropTypes } from 'react';
import { compose, pure } from 'recompose';
import { StyleRoot } from 'radium';
import { connect } from 'react-redux';
import ToggleDisplay from 'react-toggle-display';
import Mailgun from 'mailgun';
import $ from 'jquery';
import Score from './Score';
import ShareTopic from './ShareTopic';
import Xp from './Xp';
import WelcomeModal from './WelcomeModal';
// import FloatingShare from '../share';
import { linkAccount, createUser } from '../utils/UserApi';
import getCurrentTerms from '../../selectors/term';
import getCurrentTopic from '../../selectors/topic';
import shareOnUrl from '../../selectors/share';
import { getShareAllCode, getShareUrlCode, getShareTopicCode } from '../../selectors/code';

window.jQuery = $;

require('../../stylesheets/animate.min.css');
require('../../stylesheets/main.scss');
require('../../vendors/jquery.fittext');
require('../../vendors/jquery.lettering');
require('../../vendors/jquery.textillate');

const propTypes = {
  auth: PropTypes.object,
  score: PropTypes.object,
  code: PropTypes.object,
  icon: PropTypes.object,
  terms: PropTypes.array,
  topic: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  isShareOnUrl: PropTypes.object,
  siteUrl: PropTypes.string,
  mailgunKey: PropTypes.string,
  apiUrl: PropTypes.string,
  dispatch: PropTypes.func,
};

const defaultProps = {
  auth: {
    isLogin: false,
    googleToken: '',
    facebookToken: '',
    info: {},
    contacts: [],
  },
  code: {
    all: '',
    site: '',
    topic: '',
  },
  score: {
    isOpen: false,
    im_score: 0,
  },
  icon: {
    isEnable: false,
    isYoutubeTest: false,
    isEnableIM: true,
    isEnableXp: true,
  },
  topic: '',
  terms: [],
  isShareOnUrl: {
    url: '',
    type: '',
    enable: false,
  },
  isOpen: false,
  siteUrl: '',
  apiUrl: '',
  mailgunKey: '',
  dispatch: () => { },
};

const checkAuth = (type, isLinked = false) => {
  const data = {
    type: `AUTH_LOGIN_${type}`,
    payload: {
      isLinked,
    },
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

const googleContacts = () => {
  const data = {
    type: 'GOOGLE_CONTACTS',
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
    this.onClose = this.onClose.bind(this);
    this.onGoogleLogin = this.onGoogleLogin.bind(this);
    this.accessGoogleContacts = this.accessGoogleContacts.bind(this);
    this.onLinkedGoogle = this.onLinkedGoogle.bind(this);
    this.onFacebookLogin = this.onFacebookLogin.bind(this);
    this.onLinkedFacebook = this.onLinkedFacebook.bind(this);
    this.closeXp = this.closeXp.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.closeShare = this.closeShare.bind(this);
    this.openShare = this.openShare.bind(this);
    this.changeShareType = this.changeShareType.bind(this);
    this.sendEmail = this.sendEmail.bind(this);
    this.notify = this.notify.bind(this);
    this.mailgun = new Mailgun.Mailgun(this.props.mailgunKey);
  }

  onLinkedGoogle() {
    this.notify({
      title: 'Connect with Google',
      message: 'Please wait in a minute!',
    });
    this.props.dispatch(checkAuth('GOOGLE', true))
    .then(() => linkAccount(`${this.props.apiUrl}/user/link?user_id=${this.props.auth.userId}&hash=${this.props.auth.userHash}`, {
        google_user_id: this.props.auth.googleUserId,
      }))
    .catch((err) => {
      this.notify({
        title: 'Oops!',
        message: err.message,
      });
    });
  }

  onLinkedFacebook() {
    this.notify({
      title: 'Connect with Facebook',
      message: 'Please wait in a minute!',
    });
    this.props.dispatch(checkAuth('FACEBOOK', true))
    .then(() => linkAccount(`${this.props.apiUrl}/user/link?user_id=${this.props.auth.userId}&hash=${this.props.auth.userHash}`, {
        fb_user_id: this.props.auth.facebookUserId,
    }))
    .catch((err) => {
      this.notify({
        title: 'Oops!',
        message: err.message,
      });
    });
  }

  onGoogleLogin() {
    this.notify({
      title: 'Google Login',
      message: 'Please wait in a minute!',
    });
    this.props.dispatch(checkAuth('GOOGLE'))
      .then(() => {
        if (this.props.auth.isLogin) {
          this.props.dispatch(fetchContacts());
          const names = this.props.auth.info.name.split(' ');
          const firstName = names[0];
          const lastName = names.slice(1, names.length).join(' ');
          return createUser(`${this.props.apiUrl}/user/google`, {
            firstName,
            lastName,
            email: this.props.auth.info.email,
            avatar: this.props.auth.info.picture,
            google_user_id: this.props.auth.googleUserId,
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
        this.props.dispatch({
          type: 'PRELOAD_SHARE_ALL',
          payload: {
            userId,
          },
        });
      })
      .catch((err) => {
        this.notify({
          title: 'Oops!',
          message: err.message,
        });
      });
  }

  onFacebookLogin() {
    this.notify({
      title: 'Facebook Login',
      message: 'Please wait in a minute!',
    });
    this.props.dispatch(checkAuth('FACEBOOK'))
    .then(() => {
      if (this.props.auth.isLogin) {
        const names = this.props.auth.info.name.split(' ');
        const firstName = names[0];
        const lastName = names.slice(1, names.length).join(' ');
        return createUser(`${this.props.apiUrl}/user/fb`, {
          firstName,
          lastName,
          email: this.props.auth.info.email,
          avatar: this.props.auth.info.picture,
          fb_user_id: this.props.auth.facebookUserId,
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
      this.props.dispatch({
        type: 'PRELOAD_SHARE_ALL',
        payload: {
          userId,
        },
      });
    })
    .catch((err) => {
      this.notify({
        title: 'Oops!',
        message: err.message,
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

  accessGoogleContacts() {
    this.notify({
      title: 'Google Connect',
      message: 'Please wait in a minute!',
    });
    this.props.dispatch(googleContacts())
      .then(() => {
        this.notify({
          title: 'Success',
          message: 'Loading google data...',
        });
        return this.props.dispatch(fetchContacts());
      })
      .catch((err) => {
        this.notify({
          title: 'Oops!',
          message: err.message,
        });
      });
  }

  notify(msg) {
    this.props.dispatch({
      type: 'NOTIFY_MESSAGE',
      payload: msg,
    });
  }

  closeXp() {
    this.props.dispatch({
      type: 'SWITCH_XP',
      payload: {
        isEnableXp: !this.props.icon.isEnableXp,
      },
    });
  }

  openShare() {
    this.props.dispatch({
      type: 'OPEN_SHARE_MODAL',
      payload: {
        url: window.location.href,
      },
    });
  }

  changeShareType(type) {
    this.props.dispatch({
      type: 'OPEN_SHARE_MODAL',
      payload: {
        url: window.location.href,
        type,
      },
    });
  }

  closeShare() {
    this.props.dispatch({
      type: 'CLOSE_SHARE_MODAL',
      payload: {
        url: window.location.href,
      },
    });
  }

  sendEmail(name, email, topic, url) {
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
                          <tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top"> <img src="https://firebasestorage.googleapis.com/v0/b/maomao-testing.appspot.com/o/ps_sirius_dog_blue.png?alt=media&token=36329989-7ca0-4210-a56a-d7a76592ad55" /> </td></tr>
                          <tr>
                            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                              <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Hi ${name || 'there'},</p>
                              <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">${this.fullName} would like to share the MaoMao stream with you: <strong>${topic}.</p>
                              <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Click <a href="${url}" target="_blank">here</a> to unlock ${this.fullName}'s stream - you'll get to see his best picks in this stream on your Maomao homepage!</p>
                              <table border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; box-sizing: border-box;" width="100%">
                                <tbody>
                                  <tr>
                                    <td align="left" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" valign="top">
                                      <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                                        <tbody>
                                          <tr>
                                            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; background-color: #3498db; border-radius: 5px; text-align: center;" valign="top" bgcolor="#3498db" align="center"><a href="${url}" target="_blank" style="display: inline-block; color: #ffffff; background-color: #3498db; border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-transform: capitalize; border-color: #3498db;">Unlock Now!</a></td>
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
          this.notify({
            title: 'Oops!',
            message: `Sending error to ${email}`,
          });
        } else {
          this.notify({
            title: 'Sending invitation!',
            message: `Email has been sent to ${email}`,
          });
        }
      });
  }

  render() {
    return (
      <StyleRoot>
        <div className="maomao-ext-component">
          {/* <FloatingShare /> */}
          <WelcomeModal
            auth={this.props.auth}
            onGoogleLogin={this.onGoogleLogin}
            onFacebookLogin={this.onFacebookLogin}
            onLinkedFacebook={this.onLinkedFacebook}
            onLinkedGoogle={this.onLinkedGoogle}
            onClose={this.onClose}
            onLogout={this.onLogout}
            isOpen={this.props.isOpen}
          />
          <ShareTopic
            enable={this.props.isShareOnUrl.enable}
            type={this.props.isShareOnUrl.type}
            terms={this.props.terms}
            topic={this.props.topic}
            code={this.props.code}
            sendEmail={this.sendEmail}
            changeShareType={this.changeShareType}
            accessGoogleContacts={this.accessGoogleContacts}
            contacts={this.props.auth && this.props.auth.contacts}
            notify={this.notify}
            closeShare={this.closeShare}
          />
          <ToggleDisplay
            if={
              this.props.auth.isLogin
              && this.props.score.isOpen
              && this.props.score.im_score > 0
              && this.props.icon.isEnableIM
            }
          >
            <Score score={this.props.score} />
          </ToggleDisplay>
          <ToggleDisplay
            if={
              this.props.auth.isLogin
              && this.props.icon.isEnableXp
              && this.props.terms.length > 0
            }
          >
            <Xp
              terms={this.props.terms} shareTopics={this.openShare} closeXp={this.closeXp}
            />
          </ToggleDisplay>
        </div>
      </StyleRoot>
    );
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

const enhance = compose(
  pure,
);

const mapStateToProps = state => ({
  auth: state.auth,
  isOpen: state.modal,
  isShareOnUrl: shareOnUrl(state),
  score: state.score,
  terms: getCurrentTerms(state),
  topic: getCurrentTopic(state),
  code: {
    all: getShareAllCode(state),
    site: getShareUrlCode(state),
    topic: getShareTopicCode(state),
  },
  icon: state.icon,
});

export default connect(mapStateToProps)(enhance(App));
