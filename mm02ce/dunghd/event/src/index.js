import axios from 'axios';
import firebase from 'firebase';
import mobx from 'mobx';
// import faker from 'faker';
import { wrapStore, alias } from 'react-chrome-redux';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'remote-redux-devtools';
import createLogger from 'redux-logger';
import { batchActions, enableBatching } from 'redux-batched-actions';

import aliases from './aliases';
import rootReducer from './reducers';
import Config from './config';
import { saveImScore, checkImScore } from './imscore';

// NOTE: Expose global modules for bg.js
/* eslint-disable */
require('expose?$!expose?jQuery!jquery');
require('expose?_!underscore');
require('expose?StackTrace!stacktrace-js');
require('expose?moment!moment');
require('expose?firebase!firebase');
require('expose?mobx!mobx');
/* eslint-enable */

const logger = createLogger();
const config = new Config();
const middleware = [
  alias(aliases),
  thunkMiddleware,
  logger,
];
const composeEnhancers = composeWithDevTools({ realtime: true });
const store = createStore(enableBatching(rootReducer), {}, composeEnhancers(
  applyMiddleware(...middleware),
));

wrapStore(store, { portName: 'maomao-extension' });

// ctx menu handler
chrome.contextMenus.removeAll();

// NOTE: Handler all browser action events
function onClickHandler(info) {
  switch (info.menuItemId) {
    case 'mm-btn-share':
      {
        store.dispatch({
          type: 'OPEN_SHARE_MODAL',
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
      console.warn('No processing for this ctx menu event');
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

function queryString(obj) {
  const str = [];
  Object.keys(obj).forEach((prop) => {
    str.push(`${encodeURIComponent(prop)}=${encodeURIComponent(obj[prop])}`);
  });
  return str.join('&');
}

function autoLogin() {
  chrome.identity.getAuthToken({
    interactive: false,
  }, (token) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else if (token) {
      const credential = firebase.auth.GoogleAuthProvider.credential(null, token);
      firebase.auth().signInWithCredential(credential).catch(error => console.warn(error));
      axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`)
        .then((response) => {
          store.dispatch({
            type: 'USER_HASH',
            payload: {
              userHash: response.data.sub,
            },
          });
          store.dispatch({
            type: 'AUTH_FULFILLED',
            payload: {
              token,
              info: response.data,
            },
          });
          syncImScore(false);
          store.dispatch({
            type: 'FETCH_CONTACTS',
          });
          // register user
          axios({
            method: 'post',
            url: `${config.apiUrl}/user/google`,
            data: queryString({
              email: response.data.email,
              firstName: response.data.family_name,
              lastName: response.data.given_name,
              avatar: response.data.picture,
              gender: response.data.gender,
              google_user_id: response.data.sub,
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }).then((user) => {
            let userId = -1;
            if (user.data && user.data.id) {
              userId = user.data.id;
            }
            store.dispatch({
              type: 'USER_AFTER_LOGIN',
              payload: {
                userId,
              },
            });
            window.userId = userId;
            window.isGuest = false;
          }).catch(error => console.warn(error));
        })
        .catch(error => console.warn(error));
    } else console.warn('The OAuth Token was null');
  });
}

function initFirebaseApp() {
  // Listen for auth state changes.
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.warn('... firebase :', user);
    }
  });
}

window.onload = () => {
  initFirebaseApp();
  autoLogin();
};
