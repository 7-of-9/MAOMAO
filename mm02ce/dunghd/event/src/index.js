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
import { googleAutoLogin, facebookAutoLogin } from './autologin';

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


let runOnStartUp = true;
function autoLogin(user) {
  // TODO: Need to implement autoLogin
  if (runOnStartUp) {
    runOnStartUp = false;
    let googleUserId = '';
    let facebookUserId = '';
    let facebookEmail = '';
    if (user.providerData && user.providerData.length) {
      for (let counter = 0; counter < user.providerData.length; counter += 1) {
        if (user.providerData[counter].providerId === 'google.com') {
          googleUserId = user.providerData[counter].uid;
        }
        if (user.providerData[counter].providerId === 'facebook.com') {
          facebookUserId = user.providerData[counter].uid;
          facebookEmail = user.providerData[counter].email;
        }
      }
    }
    console.warn('googleUserId', googleUserId);
    console.warn('facebookUserId', facebookUserId);
    if (googleUserId) {
       googleAutoLogin(store, syncImScore, config, googleUserId, user);
    }

    if (facebookUserId) {
       facebookAutoLogin(store, syncImScore, config, facebookUserId, facebookEmail, user);
    }
  }
}

function initFirebaseApp() {
  // Listen for auth state changes.
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.warn('... firebase :', user);
      autoLogin(user);
    }
  });
}

window.onload = () => {
  initFirebaseApp();
};
