import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose, withHandlers, withState, lifecycle, onlyUpdateForKeys } from 'recompose';
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';
import $ from 'jquery';
import * as logger from 'loglevel';
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

const userMenu = (auth, dispatch) => <Dropdown>
  <DropdownTrigger>☰</DropdownTrigger>
  <DropdownContent>
    <img src={auth.info.picture} alt={auth.info.name} /> {auth.info.name} ({auth.info.email})
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
  changeShareOption, getLink,
) => {
  if (!url || !status) {
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
              Maomao is thinking...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isInternalTab(url)) {
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
          <p className="paragraph-share">Maomao thinks this page is boring!</p>
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
                const src = `https://www.facebook.com/sharer.php?u=${encodeURI(shareUrl)}`;
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
        </div>
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
            <p className="paragraph-share">Maomao isn’t looking at this page!</p>
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
              Maomao is thinking...
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
        <button
          className="power-group"
          onClick={() => {
            dispatch({
              type: 'OPEN_MODAL',
            });
          }}
        >
          <div className="power-button">
            <div className="power-inner">
              <span />
            </div>
          </div>
        </button>
        <p>Click to turn it on!</p>
      </div>
    </div>
  );
};

const App = ({
  status, auth, nlp, url, icon,
  dispatch, shareOption, changeShareOption, getLink,
 }) =>
  <div style={{ margin: '0 auto' }}>
    {render(
      status, auth, nlp, removeHashFromUrl(url), icon,
      dispatch, shareOption, changeShareOption, getLink,
    )}
  </div>;

App.propTypes = propTypes;
App.defaultProps = defaultProps;

const enhance = compose(
  withState('url', 'activeUrl', ''),
  withState('status', 'isReady', false),
  withState('shareOption', 'updateShareOption', ''),
  withHandlers({
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
          if (activeTab.status === 'complete') {
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
      // resize div
      $('#app').width(document.getElementById('app').firstChild.offsetWidth);
      $('#app').height(document.getElementById('app').firstChild.offsetHeight);
    },
    componentDidUpdate() {
      // resize div
      $('#app').width(document.getElementById('app').firstChild.offsetWidth);
      $('#app').height(document.getElementById('app').firstChild.offsetHeight);
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
