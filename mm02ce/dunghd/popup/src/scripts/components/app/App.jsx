import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose, withHandlers, withState, lifecycle, onlyUpdateForKeys } from 'recompose';
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';
import logger from './logger';
import FacebookButton from './FacebookButton';
import FacebookMessengerButton from './FacebookMessengerButton';
import GoogleButton from './GoogleButton';
import LinkButton from './LinkButton';
import ShareOptions from './ShareOptions';
import { isInternalTab, openUrl, removeHashFromUrl, fbScrapeShareUrl } from './utils';

require('../../stylesheets/main.scss');

const SITE_URL = 'https://maomaoweb.azurewebsites.net';
const FB_APP_ID = '386694335037120';

const propTypes = {
  status: PropTypes.bool,
  url: PropTypes.string,
  shareOption: PropTypes.string,
  icon: PropTypes.object,
  auth: PropTypes.object,
  nlp: PropTypes.object,
  dispatch: PropTypes.func,
  getLink: PropTypes.func,
  onFacebookLogin: PropTypes.func,
  changeShareOption: PropTypes.func,
};

const defaultProps = {
  status: false,
  url: '',
  shareOption: 'site',
  icon: {
    urls: [],
  },
  auth: {
    isLogin: false,
    accessToken: '',
    info: {},
    contacts: [],
  },
  nlp: {
    nlps: [],
    texts: [],
    scores: [],
    terms: [],
    records: [],
  },
  dispatch: () => { },
  getLink: () => { },
  onFacebookLogin: () => { },
  changeShareOption: () => { },
};

const isRunable = (url, icon) => {
  const curentIcon = icon.urls.find(item => item.url === url);
  if ((curentIcon && curentIcon.text.length === 0) || (curentIcon && curentIcon.text.indexOf('!') !== -1)) {
    return false;
  }
  return true;
};

const isAllowToShare = (url, records) => {
  if (records && records.length) {
    const isExist = records.filter(item => item.url === url);
    return isExist.length > 0;
  }

  return false;
};

const getCurrentTopics = (url, records, terms) => {
  const topics = [];
  if (records.length) {
    const existRecord = records.find(item => item.url === url);
    if (existRecord && existRecord.data.tld_topic_id) {
      topics.push({ id: `${existRecord.data.tld_topic_id}-tld-${existRecord.data.tld_topic}`, name: existRecord.data.tld_topic });
    }
  }
  if (terms.length) {
    const existRecord = terms.find(item => item.url === url);
    if (existRecord) {
      topics.push(...existRecord.topics.map(item => ({ id: `${item.term_id}-beta-${item.term_name}`, name: item.term_name })));
    }
  }
  return topics;
};


const getShareAllCode = codes => (codes.all && codes.all.share_code) || '';

/* eslint-disable camelcase */

const getShareUrlCode = (url, codes, records) => {
  if (records.length) {
    const exist = records.find(item => item && item.url === url);
    if (exist) {
      const { data: { url_id } } = exist;
      const findCode = codes.sites.find(item => item && item.url_id === url_id);
      return (findCode && findCode.share_code) || '';
    }
  }
  return '';
};

const getShareTopicCode = (code, key) => {
  logger.warn('getShareTopicCode', code, key);
  if (code && code.topics && code.topics.length) {
    const findCode = code.topics.find(item => (`${item.id}-tld-${item.name}` === key || `${item.id}-beta-${item.name}` === key));
    if (findCode) {
      return findCode.share_code;
    }
  }
  return '';
};

const userMenu = (auth, dispatch) =>
  <Dropdown className="dropdown-panel">
    <DropdownTrigger className="trigger-nav">
      <span />
      <span />
      <span />
    </DropdownTrigger>
    <DropdownContent>
      <div className="dropdown-account">
        <span className="image-account">
          <img src={auth.info.picture} alt={auth.info.name} />
        </span>
        <span className="info-account">
          <span>{auth.info.name}</span>
          <span>({auth.info.email})</span>
        </span>
      </div>
      <ul>
        <li>
          <a
            onClick={() => {
              dispatch({
                type: 'OPEN_MODAL',
                payload: {},
              });
            }}
          >Profile</a>
        </li>
        <li>
          <a
            onClick={() => {
              dispatch({
                type: 'AUTH_LOGOUT',
                payload: {},
              });
            }}
          >Logout</a>
        </li>
      </ul>
    </DropdownContent>
  </Dropdown>;

const render = (
  status, auth, nlp, url, icon, dispatch, shareOption,
  changeShareOption, getLink, onFacebookLogin,
) => {
  if (!url || !status) {
    return (
      <div className="popup-browser">
        <h3 className="share-heading">
          <a href="#home">
            <span className="maomao-logo" />
            <span className="maomao-text" />
          </a>
        </h3>
        <div className="popup-content">
          <div className="circle-share">
            <p
              className="paragraph-share"
            >
              maomao is thinking...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isInternalTab(url)) {
    return (
      <div className="popup-browser">
        <h3 className="share-heading">
          <a href="#home">
            <span className="maomao-logo" />
            <span className="maomao-text" />
          </a>
        </h3>
        <div className="popup-content">
          <p className="paragraph-share">maomao thinks this page is boring!</p>
        </div>
      </div>
    );
  }

  if (auth.isLogin) {
    const topics = getCurrentTopics(url, nlp.records, nlp.terms);
    if (isAllowToShare(url, nlp.records)) {
      const shareUrl = `${SITE_URL}/${getLink()}`;
      fbScrapeShareUrl(shareUrl);
      logger.warn('url', shareUrl);
      const currentTopics = getCurrentTopics(url, nlp.records, nlp.terms);
      logger.warn('currentTopics', currentTopics);
      return (
        <div className="popup-browser">
          {auth.isLogin && userMenu(auth, dispatch)}
          <h3 className="share-heading">
            <a href="#home">
              <span className="maomao-logo" />
              <span className="maomao-text" />
            </a>
          </h3>
          <p className="select-cn-title">SHARE YOUR STREAM :</p>
          <div className="popup-content pt0">
            <ShareOptions
              url={url}
              active={shareOption || (currentTopics[0] && currentTopics[0].id)}
              topics={topics}
              onChange={changeShareOption}
            />
          </div>
          <p className="select-cn-title">WITH FRIENDS FROM:</p>
          <div className="toolbar-button toolbar-share">
            <GoogleButton
              onClick={() => {
                dispatch({ type: 'MAOMAO_ENABLE', payload: { url } });
                dispatch({ type: 'OPEN_SHARE_MODAL', payload: { url, shareOption, currentStep: 3, type: 'Google' } });
              }}
            >
              <span title="Share with Google" className="tooltip" />
            </GoogleButton>
            <FacebookButton
              onClick={() => {
                const closePopupUrl = `${SITE_URL}/static/success.html`;
                const src = `https://www.facebook.com/dialog/share?app_id=${FB_APP_ID}&display=popup&href=${encodeURI(shareUrl)}&redirect_uri=${encodeURI(closePopupUrl)}&hashtag=${encodeURI('#maomao.rocks')}`;
                openUrl(src);
              }}
            >
              <span title="Share with Facebook" className="tooltip" />
            </FacebookButton>
            <FacebookMessengerButton
              onClick={() => {
                const closePopupUrl = `${SITE_URL}/static/success.html`;
                const src = `https://www.facebook.com/dialog/send?app_id=${FB_APP_ID}&display=popup&link=${encodeURI(shareUrl)}&redirect_uri=${encodeURI(closePopupUrl)}`;
                openUrl(src);
              }}
            >
              <span title="Share with Messenger" className="tooltip" />
            </FacebookMessengerButton>
            <LinkButton
              onClick={() => {
                dispatch({ type: 'MAOMAO_ENABLE', payload: { url } });
                dispatch({ type: 'OPEN_SHARE_MODAL', payload: { url, shareOption, currentStep: 3, type: 'Link' } });
              }}
            >
              <span title="Share with Link" className="tooltip" />
            </LinkButton>
          </div>
        </div >
      );
    }
    if (!isRunable(url, icon)) {
      return (
        <div className="popup-browser">
          {auth.isLogin && userMenu(auth, dispatch)}
          <h3 className="share-heading">
            <a href="#home">
              <span className="maomao-logo" />
              <span className="maomao-text" />
            </a>
          </h3>
          <div className="popup-content">
            <p className="paragraph-share">maomao isn’t looking at this page!</p>
          </div>
        </div>
      );
    }
    // TODO: check on site is allowable or not
    return (
      <div className="popup-browser">
        {auth.isLogin && userMenu(auth, dispatch)}
        <h3 className="share-heading">
          <a href="#home">
            <span className="maomao-logo" />
            <span className="maomao-text" />
          </a>
        </h3>
        <div className="popup-content">
          <div className="circle-share">
            <p
              className="paragraph-share"
            >
              maomao is thinking...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-browser">
      <h3 className="share-heading">
        <a href="#home">
          <span className="maomao-logo" />
          <span className="maomao-text" />
        </a>
      </h3>
      <div className="popup-content">
        <h1 style={{ fontSize: '25px' }} >Join maomao now!</h1>
        <button
          className="btn btn-block btn-social btn-facebook"
          onClick={onFacebookLogin}
        >
          <span><i className="icons-facebook" /></span>
          SIGN IN WITH FACEBOOK
        </button>
      </div>
    </div>
  );
};

const App = ({
  status, auth, nlp, url, icon,
  dispatch, shareOption, changeShareOption,
  getLink, onFacebookLogin,
 }) =>
  <div style={{ margin: '0 auto' }}>
    {render(
      status, auth, nlp, removeHashFromUrl(url), icon,
      dispatch, shareOption, changeShareOption, getLink, onFacebookLogin,
    )}
  </div>;

App.propTypes = propTypes;
App.defaultProps = defaultProps;

const notify = msg => ({
  type: 'NOTIFY_MESSAGE',
  payload: msg,
});

const checkAuth = (type, isLinked = false) => {
  const data = {
    type: `AUTH_LOGIN_${type}`,
    payload: {
      isLinked,
    },
  };
  return data;
};


const enhance = compose(
  withState('url', 'activeUrl', ''),
  withState('status', 'isReady', false),
  withState('shareOption', 'updateShareOption', ''),
  withHandlers({
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
    changeShareOption: props => (val) => {
      props.updateShareOption(val);
    },
    getLink: props => () => {
      const currentTopics = getCurrentTopics(props.url, props.nlp.records, props.nlp.terms);
      let shareOption = props.shareOption;
      if (shareOption === '') {
        shareOption = (currentTopics[0] && currentTopics[0].id);
      }
      switch (shareOption) {
        case 'all': return getShareAllCode(props.code);
        case 'site': return getShareUrlCode(props.url, props.code, props.nlp.records);
        default:
          return getShareTopicCode(props.code, shareOption, props.nlp.records);
      }
    },
    onReady: props => () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs != null && tabs.length > 0) {
          const activeTab = tabs[0];
          const url = activeTab.url;
          logger.warn('props', url, props, activeTab);
          if (activeTab.status === 'complete' || url.length > 0) {
            props.isReady(true);
          }
          const topics = getCurrentTopics(url, props.nlp.records, props.nlp.terms);
          logger.warn('topics', topics);
          if (topics.length) {
            props.updateShareOption(topics[0].id);
          }
          if (url !== props.url) {
            props.activeUrl(url);
            chrome.tabs.onUpdated.addListener((tabId, info) => {
              logger.warn('tabId, info', tabId, info);
              if (info.status === 'complete' && tabId === activeTab.id) {
                logger.warn('complete', info);
                props.isReady(true);
              }
            });
          }
        }
      });
    },
  }),
  lifecycle({
    componentDidMount() {
      logger.info('App');
      this.props.onReady();
    },
  }),
  onlyUpdateForKeys(['auth', 'nlp', 'code', 'url', 'icon', 'shareOption', 'status']),
);

const mapStateToProps = state => ({
  auth: state.auth,
  nlp: state.nlp,
  code: state.code,
  icon: state.icon,
});
export default connect(mapStateToProps)(enhance(App));
