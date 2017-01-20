import firebase from 'firebase';
import mobx from 'mobx';
import { wrapStore, alias } from 'react-chrome-redux';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'remote-redux-devtools';
import createLogger from 'redux-logger';
import { batchActions, enableBatching } from 'redux-batched-actions';

import aliases from './aliases';
import rootReducer from './reducers';
import Config from './config';

// NOTE: Expose global modules for bg.js
/* eslint-disable */
require('expose?$!expose?jQuery!jquery');
require('expose?_!underscore');
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

wrapStore(store, {
  portName: 'maomao-extension',
});

// ctx menu handler
chrome.contextMenus.removeAll();

// NOTE: Handler all browser action events
function onClickHandler(info) {
  switch (info.menuItemId) {
    case 'mm-btn-logout': {
      console.log('trigger logout');
      const data = {
        type: 'AUTH_LOGOUT',
        payload: {},
      };
      store.dispatch(data);
    }
      break;
    case 'mm-btn-disable-youtube':
      window.enableTestYoutube = false;
      {
        console.log('disable youtube');
        const data = {
          type: 'YOUTUBE_TEST',
          payload: {
            enable: window.enableTestYoutube,
          },
        };
        store.dispatch(data);
      }
      break;
    case 'mm-btn-enable-youtube':
      window.enableTestYoutube = true;
      {
        console.log('enable youtube');
        const data = {
          type: 'YOUTUBE_TEST',
          payload: {
            enable: window.enableTestYoutube,
          },
        };
        store.dispatch(data);
      }
      break;
    case 'mm-btn-login':
    case 'mm-btn-show':
      {
        console.log('show login form');
        const data = {
          type: 'OPEN_MODAL',
          payload: {},
        };
        store.dispatch(data);
      }
      break;
    default:
      console.log('No processing for this ctx menu event');
  }
}

chrome.contextMenus.onClicked.addListener(onClickHandler);

// user change tab

/**
 * Check im_score base on active url and update time
 */
function checkImScore(url, updateAt) {
  // checking current url is allow or not
  if (window.sessionObservable.urls.get(url)) {
    store.dispatch(batchActions(
      [
        {
          type: 'IM_SCORE',
          payload: {
            url,
            updateAt,
          },
        },
        {
          type: 'IM_ALLOWABLE',
          payload: {
            url,
            isOpen: true,
          },
        },
      ]));
  } else {
    store.dispatch(batchActions(
      [
        {
          type: 'IM_SCORE',
          payload: {
            url,
            updateAt,
          },
        },
        {
          type: 'IM_ALLOWABLE',
          payload: {
            url,
            isOpen: false,
          },
        },
      ]));
  }
}


// tracking latest record for by url
const histories = {};

/**
 * Save im_score and save latest record on for tracking history
 */
function saveImScore(url) {
  const now = new Date().toISOString();
  if (window.sessionObservable.urls.get(url) && Number(window.userId) > 0) {
    const data = Object.assign({}, window.mm_get_imscore(url), { userId: window.userId });

    // find which changes from last time
    if (histories[url]) {
      data.im_score -= Number(histories[url].im_score);
      data.audible_pings -= Number(histories[url].audible_pings);
      data.time_on_tab -= Number(histories[url].time_on_tab || 0);
    }

    // fix time_on_tab is null
    if (isNaN(parseFloat(data.time_on_tab))) {
      data.time_on_tab = 0;
    }

    // TODO: only save when im_score change
    if (Number(data.im_score) > 0) {
      window.ajax_put_UrlHistory(data,
        (error) => {
          histories[url] = data;
          store.dispatch({
            type: 'IM_SAVE_ERROR',
            payload: {
              url,
              saveAt: now,
              history: {
                data,
                error,
              },
            },
          });
        },
        (result) => {
          histories[url] = data;
          store.dispatch({
            type: 'IM_SAVE_SUCCESS',
            payload: {
              url,
              saveAt: now,
              history: {
                data,
                result,
              },
            },
          });
        });
    }
  }
}

window.sessionObservable = mobx.observable({
  urls: mobx.observable.map({}),
  activeUrl: '',
  updateAt: new Date().toISOString(),
});

mobx.reaction(() => window.sessionObservable.activeUrl, (url) => {
  console.info('reaction url', url);
  const now = new Date().toISOString();
  const startsWith = String.prototype.startsWith;

  if (startsWith.call(url, 'chrome://extensions')) {
    store.dispatch({
      type: 'MAOMAO_DISABLE',
      payload: {
        url,
      },
    });
  } else if (!startsWith.call(url, 'chrome-extension://')) {
    store.dispatch({
      type: 'MAOMAO_ENABLE',
      payload: {
        url,
      },
    });
    if (Number(window.userId) > 0) {
      checkImScore(url, now);
      saveImScore(url);
    }
  }
});

mobx.reaction(() => window.sessionObservable.updateAt, (updateAt) => {
  console.info('reaction updateAt', updateAt);
  const url = window.sessionObservable.activeUrl;
  checkImScore(url, updateAt);
});

// save im_score every 30 seconds
const ROUND_CLOCK = 30;
setInterval(() => {
  // TODO: Should send data when its changes
  const url = window.sessionObservable.activeUrl;
  console.log('Save im_score every ', ROUND_CLOCK, ' seconds');
  saveImScore(url);
}, ROUND_CLOCK * 1000);

// firebase auth
// init firebase
firebase.initializeApp({
  apiKey: config.firebaseKey,
  databaseURL: config.firebaseDB,
  storageBucket: config.firebaseStore,
});

function initFirebaseApp() {
  console.log('initFirebaseApp');
  // Listen for auth state changes.
  firebase.auth().onAuthStateChanged((user) => {
    console.log('firebase => User state change detected from the Background script of the Chrome Extension:', user);
  });
}

window.onload = () => {
  initFirebaseApp();
};
