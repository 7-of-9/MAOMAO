import firebase from 'firebase';
import mobx from 'mobx';
// import faker from 'faker';
import { wrapStore, alias } from 'react-chrome-redux';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import createMigration from 'redux-persist-migrate';
import { composeWithDevTools } from 'remote-redux-devtools';
import { createLogger } from 'redux-logger';
import { batchActions, enableBatching } from 'redux-batched-actions';

import aliases from './aliases';
import rootReducer from './reducers';
import Config from './config';
import { saveImScore, checkImScore } from './imscore';

// NOTE: Expose global modules for bg.js
/* eslint-disable */
require('expose-loader?$!expose-loader?jQuery!jquery');
require('expose-loader?_!underscore');
require('expose-loader?StackTrace!stacktrace-js');
require('expose-loader?moment!moment');
require('expose-loader?firebase!firebase');
require('expose-loader?mobx!mobx');
/* eslint-enable */

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

const composeEnhancers = composeWithDevTools({ realtime: true });
const store = createStore(enableBatching(rootReducer), {}, composeEnhancers(
  migration,
  autoRehydrate(),
  applyMiddleware(...middleware),
));

persistStore(store);

wrapStore(store, {
  portName: 'maomao-extension',
 });

// ctx menu handler
chrome.contextMenus.removeAll();

// NOTE: Handler all browser action events
function onClickHandler(info) {
  switch (info.menuItemId) {
    case 'mm-btn-share':
      {
        chrome.tabs.query({
          active: true,
          currentWindow: true,
        }, (tabs) => {
          if (tabs != null && tabs.length > 0) {
            let url = '';
            if (tabs[0] && tabs[0].url && url !== tabs[0].url) {
              url = tabs[0].url;
              store.dispatch({
                type: 'OPEN_SHARE_MODAL',
                payload: {
                  url,
                  type: 'Google',
                },
              });
            }
          }
        });
      }
      break;
    case 'mm-btn-logout':
      {
        const data = {
          type: 'AUTH_LOGOUT',
          payload: {},
        };
        store.dispatch(data);
      }
      break;
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
      }
      break;
    case 'mm-btn-switch-xp':
      {
        if (window.enableXp) {
          window.enableXp = false;
        } else {
          window.enableXp = true;
        }
        const data = {
          type: 'SWITCH_XP',
          payload: {
            isEnableXp: window.enableXp,
          },
        };
        store.dispatch(data);
      }
      break;
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
      }
      break;
    case 'mm-btn-login':
    case 'mm-btn-show':
      {
        const data = {
          type: 'OPEN_MODAL',
          payload: {},
        };
        store.dispatch(data);
      }
      break;
    default:
  }
}

chrome.contextMenus.onClicked.addListener(onClickHandler);

function syncImScore(forceSave) {
  chrome.tabs.query({
    active: true,
    currentWindow: true,
  }, (tabs) => {
    if (tabs != null && tabs.length > 0) {
      let url = '';
      const now = new Date().toISOString();
      if (tabs[0] && tabs[0].url && url !== tabs[0].url) {
        url = tabs[0].url;
      }
      url = window.bglib_remove_hash_url(url);
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
  });
}

window.sessionObservable = mobx.observable({
  urls: mobx.observable.map({}),
  icons: mobx.observable.map({}),
  activeUrl: '',
  lastUpdate: Date.now(),
});

mobx.reaction(() => window.sessionObservable.lastUpdate, () => {
  syncImScore(false);
});

mobx.reaction(() => window.sessionObservable.activeUrl, () => {
  // save db when user change url
  syncImScore(true);
});

// save im_score every 30 seconds
const ROUND_CLOCK = 30;
setInterval(() => {
  if (Number(window.userId) > 0) {
    syncImScore(true);
  }
}, ROUND_CLOCK * 1000);

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
      console.warn('... firebase :', user);
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
    store.dispatch({
      type: 'RESET_SETTINGS',
      payload: {
        isEnableIM: window.enableImscore,
        isEnableXp: window.enableXp,
        isYoutubeTest: window.enableTestYoutube,
      },
    });
    syncImScore(false);
  }, 1000);
};
