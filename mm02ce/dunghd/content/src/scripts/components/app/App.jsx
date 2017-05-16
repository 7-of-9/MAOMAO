import React from 'react';
import PropTypes from 'prop-types';
import { compose, withHandlers } from 'recompose';
import { StyleRoot } from 'radium';
import { connect } from 'react-redux';
import ToggleDisplay from 'react-toggle-display';
import Mailgun from 'mailgun';
import $ from 'jquery';
import Score from './Score';
import ShareTopic from './ShareTopic';
import ShareOnPage from './ShareOnPage';
import Xp from './Xp';
import WelcomeModal from './WelcomeModal';
import { getCurrentTerms, getCurrentXPTopics } from '../../selectors/term';
import getCurrentTLD from '../../selectors/tld';
import getCurrentTopics from '../../selectors/topic';
import shareOnUrl from '../../selectors/share';
import { getShareAllCode, getShareUrlCode, getShareTopicCodes } from '../../selectors/code';
import logger from '../utils/logger';

window.jQuery = $;

require('../../stylesheets/main.scss');
require('../../vendors/jquery.fittext');
require('../../vendors/jquery.lettering');
require('../../vendors/jquery.textillate');

const MAILGUN_KEY = 'key-6acu-fqm4j325jes59jc31rq557e83l6';
const mailgun = new Mailgun.Mailgun(MAILGUN_KEY);

const propTypes = {
  auth: PropTypes.object,
  score: PropTypes.object,
  code: PropTypes.object,
  icon: PropTypes.object,
  terms: PropTypes.array,
  xpTopics: PropTypes.array,
  tld: PropTypes.array,
  topics: PropTypes.array,
  isOpen: PropTypes.bool.isRequired,
  isShareOnUrl: PropTypes.object,
  onFacebookLogin: PropTypes.func,
  onLogout: PropTypes.func,
  changeShareType: PropTypes.func,
  accessGoogleContacts: PropTypes.func,
  openShare: PropTypes.func,
  closeShare: PropTypes.func,
  sendEmail: PropTypes.func,
  onClose: PropTypes.func,
  closeXp: PropTypes.func,
  closeTLD: PropTypes.func,
  notifyMsg: PropTypes.func,
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
    isEnableXP: false,
    isEnableXpInfo: false,
    isYoutubeTest: false,
    isEnableIM: false,
  },
  topics: [],
  terms: [],
  xpTopics: [],
  tld: [],
  isShareOnUrl: {
    url: '',
    type: '',
    enable: false,
  },
  isOpen: false,
  onFacebookLogin: () => { },
  onLogout: () => { },
  changeShareType: () => { },
  accessGoogleContacts: () => { },
  openShare: () => { },
  closeShare: () => { },
  sendEmail: () => { },
  onClose: () => { },
  closeXp: () => { },
  closeTLD: () => { },
  notifyMsg: () => { },
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

const notify = msg => ({
  type: 'NOTIFY_MESSAGE',
  payload: msg,
});

function sendHTMLEmail(fromEmail, fullName, name, email, topic, url, dispatch) {
  const title = `Join maomao! ${fullName} want to share with you...`;
  const emailTemplate = `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>maomao.rocks</title>
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
                <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">${fullName} would like to share the maomao stream with you: <strong>${topic}.</span>
                <table class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #fff; border-radius: 3px;" width="100%">

                  <!-- START MAIN CONTENT AREA -->
                  <tr>
                    <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                      <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                        <tr><td style="font-family: 'Rokkitt', sans-serif; vertical-align: top;" valign="top"><h1> maomao </h1></td></tr>
                        <tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top"> <img src="https://firebasestorage.googleapis.com/v0/b/maomao-testing.appspot.com/o/ps_sirius_dog_blue.png?alt=media&token=36329989-7ca0-4210-a56a-d7a76592ad55" /> </td></tr>
                        <tr>
                          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Hi ${name || 'there'},</p>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">${fullName} would like to share the maomao stream with you: <strong>${topic}.</p>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Click <a href="${url}" target="_blank">here</a> to unlock ${fullName}'s stream - you'll get to see his best picks in this stream on your maomao homepage!</p>
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
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Kind regards, <br/> maomao Team</p> <br/> www.maomao.rocks</p>
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
                        Powered by <a href="http://maomao.rocks" style="color: #999999; font-size: 12px; text-align: center; text-decoration: none;">maomao.rocks</a>.
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
  mailgun.sendRaw(joinEmailAddress,
    email,
    `From: ${joinEmailAddress}
      \nTo: ${email}
      \nContent-Type: text/html; charset=utf-8
      \nSubject: ${title}
      \n\n ${emailTemplate}`,
    (err) => {
      if (err) {
        dispatch(notify({
          title: 'Oops!',
          message: `Sending error to ${email}`,
        }));
      } else {
        dispatch(notify({
          title: 'Sending invitation!',
          message: `Email has been sent to ${email}`,
        }));
      }
    });
}

const MIN_IM_SCORE = 1; // for showing the tld xp popup

function App({ auth, isOpen, isShareOnUrl, terms, topics, code, score, icon,
  onFacebookLogin, onLogout,
  changeShareType, accessGoogleContacts, openShare, closeShare,
  closeXp, sendEmail, onClose, notifyMsg, tld, xpTopics, closeTLD,
  }) {
  logger.info('App render');
  return (
    <StyleRoot>
      <div className="maomao-ext-component">
        <ShareOnPage
          isReady={auth.isLogin && icon.isEnable && (tld.length > 0 || xpTopics.length > 0)}
          openShare={openShare}
        />
        <ToggleDisplay if={icon.isEnable}>
          <WelcomeModal
            auth={auth}
            onFacebookLogin={onFacebookLogin}
            onClose={onClose}
            onLogout={onLogout}
            isOpen={isOpen}
          />
        </ToggleDisplay>
        <ToggleDisplay
          if={
            auth.isLogin
            && isShareOnUrl.enable
            && icon.isEnable
          }
        >
          <ShareTopic
            enable={isShareOnUrl.enable}
            type={isShareOnUrl.type}
            currentStep={isShareOnUrl.currentStep}
            shareOption={isShareOnUrl.shareOption || (topics[0] && topics[0].id)}
            terms={terms}
            topics={topics}
            code={code}
            sendEmail={sendEmail}
            changeShareType={changeShareType}
            accessGoogleContacts={accessGoogleContacts}
            contacts={auth && auth.contacts}
            notify={notifyMsg}
            closeShare={closeShare}
          />
        </ToggleDisplay>
        <ToggleDisplay
          if={
            auth.isLogin
            && score.isOpen
            && score.im_score > 0
            && icon.isEnableIM
            && icon.isEnable
          }
        >
          <Score score={score} />
        </ToggleDisplay>
        <ToggleDisplay
          if={
            auth.isLogin
            && icon.isEnable
            && score.im_score > MIN_IM_SCORE
            && icon.isEnableXP
            && tld.length > 0
          }
        >
          <Xp
            terms={tld}
            shareTopics={openShare}
            closeXp={closeTLD}
          />
        </ToggleDisplay>
        <ToggleDisplay
          if={
            auth.isLogin
            && icon.isEnable
            && score.im_score > MIN_IM_SCORE
            && icon.isEnableXP
            && tld.length === 0
            && xpTopics.length > 0
          }
        >
          <Xp
            terms={xpTopics} shareTopics={openShare} closeXp={closeXp} isEnableExperimentalTopics
          />
        </ToggleDisplay>
      </div>
    </StyleRoot>
  );
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

const enhance = compose(
  withHandlers({
    notifyMsg: props => (msg) => {
      props.dispatch(notify(msg));
    },
    accessGoogleContacts: props => () => {
      props.dispatch(notify({
        title: 'Google Connect',
        message: 'Please wait in a minute!',
      }));
      props.dispatch(googleContacts())
        .then(() => {
          props.dispatch(notify({
            title: 'Success',
            message: 'Loading google data...',
          }));
          return props.dispatch(fetchContacts());
        })
        .catch((err) => {
          props.dispatch(notify({
            title: 'Oops!',
            message: err.message,
          }));
        });
    },
    onFacebookLogin: props => () => {
      props.dispatch(notify({
        title: 'Facebook Login',
        message: 'Please wait in a minute!',
      }));
      props.dispatch(checkAuth('FACEBOOK'))
        .then((result) => {
          logger.warn('result', result);
          if (result) {
            const { error } = result;
            if (error) {
              props.dispatch(notify({
                title: 'Oops!',
                message: error.message,
              }));
            }
          }
        })
        .catch((err) => {
          props.dispatch(notify({
            title: 'Oops!',
            message: err.message,
          }));
        });
    },
    onLogout: props => () => {
      props.dispatch(logout());
    },
    onClose: props => () => {
      props.dispatch({
        type: 'CLOSE_MODAL',
      });
    },
    sendEmail: props => (name, email, topic, url) => {
      const fromEmail = props.auth.info.email;
      const fullName = props.auth.info.name;
      sendHTMLEmail(fromEmail, fullName, name, email, topic, url, props.dispatch);
    },
    closeXp: props => () => {
      props.dispatch({
        type: 'TIMER_XP',
        payload: {
          url: window.location.href,
        },
      });
    },
    closeTLD: props => () => {
      props.dispatch({
        type: 'TIMER_TLD',
        payload: {
          url: window.location.href,
        },
      });
    },
    openShare: props => () => {
      props.dispatch({
        type: 'OPEN_SHARE_MODAL',
        payload: {
          url: window.location.href,
        },
      });
    },
    closeShare: props => () => {
      props.dispatch({
        type: 'CLOSE_SHARE_MODAL',
        payload: {
          url: window.location.href,
        },
      });
    },
    changeShareType: props => (type, shareOption, currentStep) => {
      props.dispatch({
        type: 'OPEN_SHARE_MODAL',
        payload: {
          url: window.location.href,
          type,
          shareOption,
          currentStep,
        },
      });
    },
  }),
);

const mapStateToProps = state => ({
  auth: state.auth,
  isOpen: state.modal,
  isShareOnUrl: shareOnUrl(state),
  score: state.score,
  terms: getCurrentTerms(state),
  xpTopics: getCurrentXPTopics(state),
  tld: getCurrentTLD(state),
  topics: getCurrentTopics(state),
  code: {
    all: getShareAllCode(state),
    site: getShareUrlCode(state),
    ...getShareTopicCodes(state),
  },
  icon: state.icon,
});

export default connect(mapStateToProps)(enhance(App));
