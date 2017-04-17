import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose, withHandlers, withState, lifecycle, onlyUpdateForKeys } from 'recompose';
import * as logger from 'loglevel';
import FacebookButton from './FacebookButton';
import FacebookMessengerButton from './FacebookMessengerButton';
import GoogleButton from './GoogleButton';
import LinkButton from './LinkButton';
import ShareOptions from './ShareOptions';
import { isInternalTab, openUrl, removeHashFromUrl } from './utils';

require('../../stylesheets/main.scss');

const SITE_URL = 'https://maomaoweb.azurewebsites.net';
const FB_APP_ID = '386694335037120';

const propTypes = {
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
  dispatch: () => {},
  getLink: () => {},
  changeShareOption: () => {},
};

const isRunable = (url, icon) => {
  logger.warn('isRunable url, icon', url, icon);
  const curentIcon = icon.urls.find(item => item.url === url);
  if ((curentIcon && curentIcon.text.length === 0) || (curentIcon && curentIcon.text.indexOf('!') !== -1)) {
    return false;
  }
  return true;
};

const isAllowToShare = (url, records) => {
  logger.warn('isAllowToShare url, records', url, records);
  if (records && records.length) {
    const isExist = records.filter(item => item.url === url);
    return isExist.length > 0;
  }

  return false;
};

const getCurrentTopics = (url, records, terms) => {
  logger.warn('getCurrentTopics url, records, terms', url, records, terms);
  const topics = [];
  if (records.length) {
    const existRecord = records.find(item => item.url === url);
    if (existRecord && existRecord.data.tld_topic_id) {
      topics.push({ id: `${existRecord.data.tld_topic_id}-${existRecord.data.tld_topic}`, name: existRecord.data.tld_topic });
    }
  }
  if (terms.length) {
    const existRecord = terms.find(item => item.url === url);
    if (existRecord) {
      topics.push(...existRecord.topics.map(item => ({ id: `${item.term_id}-${item.term_name}`, name: item.term_name })));
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
  if (code && code.topics && code.topics.length) {
    const findCode = code.topics.find(item => `${item.id}-${item.name}` === key);
    return (findCode && findCode.share_code) || '';
  }
  return '';
};

const render = (auth, nlp, url, icon, dispatch, shareOption, changeShareOption, getLink) => {
  logger.warn('render auth, nlp, url, icon, shareOption', auth, nlp, url, icon, shareOption);
  if (!url) {
    return (
      <div className="popup-browser">
        <h3 className="share-heading">
          <a href="#home"><span className="maomao-logo" /> maomao</a>
        </h3>
        <div className="popup-content">
          <p className="paragraph-share">Loading...!</p>
        </div>
      </div>
    );
  }

  if (isInternalTab(url)) {
    return (
      <div className="popup-browser">
        <h3 className="share-heading">
          <a href="#home"><span className="maomao-logo" /> maomao</a>
        </h3>
        <div className="popup-content">
          <p className="paragraph-share">Maomao is off on Google Chrome page!</p>
        </div>
      </div>
    );
  }

  if (auth.isLogin) {
    const topics = getCurrentTopics(url, nlp.records, nlp.terms);
    if (!isRunable(url, icon)) {
      return (
        <div className="popup-browser">
          <h3 className="share-heading">
            <a href="#home"><span className="maomao-logo" /> maomao</a>
          </h3>
          <div className="popup-content">
            <p className="paragraph-share">Maomao is off on this url !</p>
          </div>
        </div>
      );
    }
    if (isAllowToShare(url, nlp.records)) {
      return (
        <div className="popup-browser">
          <h3 className="share-heading">
            <a href="#home"><span className="maomao-logo" /> maomao</a>
          </h3>
          <p className="select-cn-title">Select your content:</p>
          <div className="popup-content pt0">
            <ShareOptions active={shareOption} topics={topics} onChange={changeShareOption} />
          </div>
          <div className="toolbar-button">
            <GoogleButton
              onClick={() => {
              dispatch({ type: 'MAOMAO_ENABLE', payload: { url } });
              dispatch({ type: 'OPEN_SHARE_MODAL', payload: { url, shareOption, currentStep: 3, type: 'Google' } });
            }}
            />
            <FacebookButton
              onClick={() => {
                const shareUrl = `${SITE_URL}/${getLink()}`;
                const src = `https://www.facebook.com/sharer.php?u=${encodeURI(shareUrl)}`;
                openUrl(src);
              }}
            />
            <FacebookMessengerButton
              onClick={() => {
                const shareUrl = `${SITE_URL}/${getLink()}`;
                const src = `https://www.facebook.com/dialog/send?app_id=${FB_APP_ID}&display=popup&link=${encodeURI(shareUrl)}&redirect_uri=${encodeURI(shareUrl)}`;
                openUrl(src);
              }}
            />
            <LinkButton
              onClick={() => {
                dispatch({ type: 'MAOMAO_ENABLE', payload: { url } });
                dispatch({ type: 'OPEN_SHARE_MODAL', payload: { url, shareOption, currentStep: 3, type: 'Link' } });
            }}
            />
          </div>
        </div>
      );
    }
    // TODO: check on site is allowable or not
    return (
      <div className="popup-browser">
        <h3 className="share-heading">
          <a href="#home"><span className="maomao-logo" /> maomao</a>
        </h3>
        <div className="popup-content">
          <div className="circle-share">
            <p
              className="paragraph-share"
            >
              This site is <br />
              not ready to sharing. Please wait in a few
              <br />
              mins for processing<br />
              this site !
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-browser">
      <h3 className="share-heading">
        <a href="#home"><span className="maomao-logo" /> maomao</a>
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

const App = ({ auth, nlp, url, icon, dispatch, shareOption, changeShareOption, getLink }) => <div
  style={{ margin: '0 auto' }}
>
  {
    render(
      auth, nlp, removeHashFromUrl(url), icon,
      dispatch, shareOption, changeShareOption, getLink,
     )
  }
</div>;

App.propTypes = propTypes;
App.defaultProps = defaultProps;

const enhance = compose(
  withState('url', 'activeUrl', ''),
  withState('shareOption', 'updateShareOption', 'site'),
  withHandlers({
    changeShareOption: props => (val) => {
      props.updateShareOption(val);
    },
    getLink: props => () => {
      logger.warn('shareOption', props.shareOption);
      switch (props.shareOption) {
        case 'all': return getShareAllCode(props.code);
        case 'site': return getShareUrlCode(props.url, props.code, props.nlp.records);
        default:
          return getShareTopicCode(props.code, props.shareOption);
      }
    },
    onReady: props => () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs != null && tabs.length > 0) {
          const url = tabs[0].url;
          if (url !== props.url) {
            props.activeUrl(url);
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
  onlyUpdateForKeys(['auth', 'nlp', 'code', 'url', 'icon', 'shareOption']),
);

const mapStateToProps = state => ({
  auth: state.auth,
  nlp: state.nlp,
  code: state.code,
  icon: state.icon,
});
export default connect(mapStateToProps)(enhance(App));
