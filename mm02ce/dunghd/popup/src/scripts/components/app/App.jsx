import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose, withHandlers, withState, lifecycle, onlyUpdateForKeys } from 'recompose';
import FacebookButton from './FacebookButton';
import FacebookMessengerButton from './FacebookMessengerButton';
import GoogleButton from './GoogleButton';
import LinkButton from './LinkButton';
import ShareOptions from './ShareOptions';
import { processUrl, isInternalTab, openUrl } from './utils';

const SITE_URL = 'https://maomaoweb.azurewebsites.net';
const FB_APP_ID = '386694335037120';

require('../../stylesheets/main.scss');

const propTypes = {
  url: PropTypes.string,
  shareOption: PropTypes.string,
  auth: PropTypes.object,
  nlp: PropTypes.object,
  dispatch: PropTypes.func,
  getLink: PropTypes.func,
  changeShareOption: PropTypes.func,
};

const defaultProps = {
  url: '',
  shareOption: 'site',
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

const isAllowToShare = (url, records) => {
  if (records && records.length) {
    const isExist = records.filter(item => item.url === url);
    return isExist.length > 0;
  }

  return false;
};

const getCurrentTopic = (url, records) => {
  if (records.length) {
    const existRecord = records.filter(item => item.url === url);
    if (existRecord && existRecord[0]) {
      return existRecord[0].data.tld_topic;
    }
  }
  return '';
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

const getShareTopicCode = (url, codes, records) => {
  if (records.length) {
    const exist = records.find(item => item && item.url === url);
    if (exist) {
      const { data: { tld_topic_id } } = exist;
      const findCode = codes.topics.find(item => item && item.tld_topic_id === tld_topic_id);
      return (findCode && findCode.share_code) || '';
    }
  }
  return '';
};

const render = (auth, nlp, url, dispatch, shareOption, changeShareOption, getLink) => {
  if (isInternalTab(url)) {
    return (
      <div>
        Maomao is off on internal tab!
      </div>);
  }

  if (auth.isLogin) {
    const topic = getCurrentTopic(url, nlp.records);
    if (!processUrl(url)) {
      return (
        <div>
          Maomao is off on this url!
        </div>);
    }
    if (isAllowToShare(url, nlp.records)) {
      return (
        <div>
          <h3 className="share-heading">Share this topic</h3>
          <ShareOptions active={shareOption} topic={topic} onChange={changeShareOption} />
          <div className="toolbar-button">
            <GoogleButton
              onClick={() => {
              dispatch({ type: 'MAOMAO_ENABLE', payload: { url } });
              dispatch({ type: 'OPEN_SHARE_MODAL', payload: { url, type: 'Google' } });
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
                dispatch({ type: 'OPEN_SHARE_MODAL', payload: { url, type: 'Link' } });
            }}
            />
          </div>
        </div>
      );
    }
    // TODO: check on site is allowable or not
    return (
      <div>
        This site is not ready to sharing. Please wait in a few mins for processing this site!
      </div>);
  }

  return (
    <div>
      Please click <button
        onClick={() => {
           dispatch({
                  type: 'OPEN_MODAL',
                });
      }}
      >here</button> to login :)
    </div>);
};

const App = ({ auth, nlp, url, dispatch, shareOption, changeShareOption, getLink }) => <div
  style={{ margin: '0 auto' }}
>
  {
    render(auth, nlp, url, dispatch, shareOption, changeShareOption, getLink)
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
      switch (props.shareOption) {
        case 'all': return getShareAllCode(props.code);
        case 'site': return getShareUrlCode(props.url, props.code, props.nlp.records);
        case 'topic': return getShareTopicCode(props.url, props.code, props.nlp.records);
        default:
          return '';
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
      this.props.onReady();
    },
  }),
  onlyUpdateForKeys(['auth', 'nlp', 'code', 'url']),
);

const mapStateToProps = state => ({
  auth: state.auth,
  nlp: state.nlp,
  code: state.code,
});
export default connect(mapStateToProps)(enhance(App));
