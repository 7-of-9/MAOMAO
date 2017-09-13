import firebase from 'firebase';
import * as mobx from 'mobx';
import { wrapStore, alias } from 'react-chrome-redux';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import createMigration from 'redux-persist-migrate';
import { composeWithDevTools } from 'remote-redux-devtools';
import { createLogger } from 'redux-logger';
import { batchActions, enableBatching } from 'redux-batched-actions';
import * as log from 'loglevel';
import aliases from './aliases';
import rootReducer from './reducers';
import Config from './config';
import realtimeStream from './realtime';
import { saveImScore, checkImScore } from './imscore';

// NOTE: Expose global modules for bg.js
/* eslint-disable */
require('expose-loader?$!expose-loader?jQuery!jquery');
require('expose-loader?_!underscore');
require('expose-loader?StackTrace!stacktrace-js');
require('expose-loader?moment!moment');
require('expose-loader?firebase!firebase');
require('expose-loader?mobx!mobx');
require('expose-loader?log!loglevel');
/* eslint-enable */

const dev = process.env.NODE_ENV !== 'production';
// log.setLevel('debug');
log.enableAll();

const logger = createLogger();
const config = new Config();
const middleware = [
  alias(aliases),
  thunkMiddleware,
  logger,
];
const manifest = {
  1: state => ({ ...state, staleReducer: undefined }),
  2: state => ({ ...state, app: { ...state.app, staleKey: undefined } }),
};
const reducerKey = 'app';
const migration = createMigration(manifest, reducerKey);

const composeEnhancers = composeWithDevTools({ realtime: dev });
const store = createStore(enableBatching(rootReducer), {}, composeEnhancers(
  migration,
  autoRehydrate(),
  applyMiddleware(...middleware),
));

persistStore(store, { debounce: 1 * 60 * 1000 }); // auto save in 1 min

wrapStore(store, {
  portName: 'maomao-extension',
});

// ctx menu handler
chrome.contextMenus.removeAll();

// NOTE: Handler all browser action events
function onClickHandler(info) {
  switch (info.menuItemId) {
    case 'mm-btn-reset-tld':
      {
        store.dispatch({
          type: 'RESET_TIMER_TLD',
          payload: {
            url: window.sessionObservable.activeUrl,
          },
        });
        break;
      }
    case 'mm-btn-share':
      {
        store.dispatch({
          type: 'OPEN_SHARE_MODAL',
          payload: {
            url: window.sessionObservable.activeUrl,
            enable: true,
            type: 'Google',
          },
        });
        break;
      }
    case 'mm-btn-logout':
      {
        store.dispatch({
          type: 'AUTH_LOGOUT',
          payload: {},
        });
        break;
      }
    case 'mm-btn-switch-xp':
      {
        if (window.enableXP) {
          window.enableXP = false;
        } else {
          window.enableXP = true;
        }
        const data = {
          type: 'SWITCH_XP',
          payload: {
            isEnableXP: window.enableXP,
          },
        };
        store.dispatch(data);
        break;
      }
    case 'mm-btn-switch-xpinfo':
      {
        if (window.enableXpInfo) {
          window.enableXpInfo = false;
        } else {
          window.enableXpInfo = true;
        }
        const data = {
          type: 'SWITCH_IM_XP_INFO',
          payload: {
            isEnableXpInfo: window.enableXpInfo,
          },
        };
        store.dispatch(data);
        break;
      }
    case 'mm-btn-switch-imscore':
      {
        if (window.enableImscore) {
          window.enableImscore = false;
        } else {
          window.enableImscore = true;
        }
        const data = {
          type: 'SWITCH_IM_SCORE',
          payload: {
            isEnableIM: window.enableImscore,
          },
        };
        store.dispatch(data);
        break;
      }
    case 'mm-btn-switch-icon-text':
      {
        if (window.enableIconText) {
          window.enableIconText = false;
        } else {
          window.enableIconText = true;
        }
        store.dispatch(batchActions([
          {
            type: 'SWITCH_ICON_TEXT',
            payload: {
              isEnableIconText: window.enableIconText,
            },
          },
          {
            type: 'MAOMAO_ENABLE',
            payload: {
              url: window.sessionObservable.activeUrl,
            },
          },
        ]));
        break;
      }
    case 'mm-btn-switch-youtube':
      {
        if (window.enableTestYoutube) {
          window.enableTestYoutube = false;
        } else {
          window.enableTestYoutube = true;
        }
        const data = {
          type: 'YOUTUBE_TEST',
          payload: {
            isYoutubeTest: window.enableTestYoutube,
          },
        };
        store.dispatch(data);
        break;
      }
    case 'mm-btn-switch-realtime':
      {
        if (window.enableRealtime) {
          window.enableRealtime = false;
        } else {
          window.enableRealtime = true;
        }
        const data = {
          type: 'SWITCH_REALTIME',
          payload: {
            isRealtime: window.enableRealtime,
          },
        };
        store.dispatch(data);
        break;
      }
    case 'mm-btn-login':
    case 'mm-btn-show':
      {
        store.dispatch(batchActions([
          {
            type: 'OPEN_MODAL',
            payload: {},
          },
          {
            type: 'MAOMAO_ENABLE',
            payload: {
              url: window.sessionObservable.activeUrl,
            },
          },
        ]));
        break;
      }
    default:
  }
}

chrome.contextMenus.onClicked.addListener(onClickHandler);

/**
 * save IM_SCORE
 * @param string url
 * @param bool forceSave
 */
function syncImScore(rawUrl, forceSave) {
  const now = new Date().toISOString();
  const url = window.bglib_remove_hash_url(rawUrl);
  const startsWith = String.prototype.startsWith;
  if (startsWith.call(url, 'chrome://') || startsWith.call(url, 'chrome-extension://')) {
    store.dispatch({
      type: 'MAOMAO_DISABLE',
      payload: {
        url,
      },
    });
  } else {
    store.dispatch({
      type: 'MAOMAO_ENABLE',
      payload: {
        url,
      },
    });
    if (Number(window.userId) > 0) {
      checkImScore(window.sessionObservable, batchActions, store, url, now);
      // blue icon means success
      if (forceSave) {
        saveImScore(
          window.sessionObservable,
          window.ajax_put_UrlHistory,
          store, url, Number(window.userId), window.userHash);
      }
    }
  }
}

window.sessionObservable = mobx.observable({
  urls: mobx.observable.map({}),
  icons: mobx.observable.map({}),
  activeUrl: '',
  lastUpdate: Date.now(),
});

mobx.reaction(() => window.sessionObservable.lastUpdate, () => {
  const activeUrl = window.sessionObservable.activeUrl;
  log.info('active url - check im score', activeUrl);
  syncImScore(activeUrl, false);
});

mobx.reaction(() => window.sessionObservable.activeUrl.length, () => {
  const idleState = window.idleState;
  log.warn('active url - change url', window.sessionObservable.activeUrl);
  // TODO: reset setting for experimental topics when change url
  if (window.selectedWindowId > 0) {
    chrome.tabs.query({
      active: true,
      currentWindow: true,
    }, (tabs) => {
      if (tabs != null && tabs.length > 0) {
        const activeUrl = tabs[0].url;
        log.info('case 1 - active url', activeUrl);
        const session = window.session_get_by_url(activeUrl);
        if (session) {
          window.session_stop_TOT(session);
          syncImScore(activeUrl, true);
          if (idleState === 'active' || session.audible) {
            window.session_start_TOT(session);
          }
        } else {
          log.info('case 1 - active url - check im score', activeUrl);
          syncImScore(activeUrl, false);
        }
      }
    });
  }
});

// save im_score every 30 seconds
const ROUND_CLOCK = 30;
setInterval(() => {
  log.warn('30s interval - active url', window.sessionObservable.activeUrl);
  if (Number(window.userId) > 0) {
    const idleState = window.idleState;
    if (window.selectedWindowId > 0) {
      chrome.tabs.query({
        active: true,
        currentWindow: true,
      }, (tabs) => {
        if (tabs != null && tabs.length > 0) {
          const activeUrl = tabs[0].url;
          log.info('case 2 - timer - 30s - active url', activeUrl, new Date());
          const session = window.session_get_by_url(activeUrl);
          if (session) {
            window.session_stop_TOT(session);
            syncImScore(activeUrl, true);
            if (idleState === 'active' || session.audible) {
              window.session_start_TOT(session);
            }
          } else {
            log.info('case 2 - timer - 30s - Not found session for url', activeUrl);
          }
        }
      });
    }
  }
}, ROUND_CLOCK * 1000);

// TODO: try to download new google contacts on 30 mins

// firebase auth
// init firebase
firebase.initializeApp({
  apiKey: config.firebaseKey,
  databaseURL: config.firebaseDB,
  storageBucket: config.firebaseStore,
  authDomain: config.firebaseAuthDomain,
});

function initFirebaseApp() {
  // Listen for auth state changes.
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      if (user.providerData) {
        store.dispatch({
          type: 'ACCOUNT_CONNECT',
          payload: {
            accounts: user.providerData,
          },
        });
      }
    }
  });
}

window.onload = () => {
  initFirebaseApp();
  setTimeout(() => {
    store.dispatch({
      type: 'AUTO_LOGIN',
    });

    if (dev) {
      window.enableImscore = true;
      window.enableXpInfo = true;
      window.enableIconText = true;
    }
    store.dispatch({
      type: 'RESET_SETTINGS',
      payload: {
        isEnableIM: window.enableImscore,
        isEnableXP: window.enableXP,
        isEnableXpInfo: window.enableXpInfo,
        isYoutubeTest: window.enableTestYoutube,
        isRealtime: window.enableRealtime,
        isEnableIconText: window.enableIconText,
      },
    });
    syncImScore(window.location.href);

    // TODO: get all friends and streams to listen new data
    realtimeStream([]);
  }, 1000);
};
