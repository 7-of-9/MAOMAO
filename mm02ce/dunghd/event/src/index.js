import { wrapStore, alias } from 'react-chrome-redux';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'remote-redux-devtools';
import createLogger from 'redux-logger';
import { batchedSubscribe } from 'redux-batched-subscribe';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';

import aliases from './aliases';
import rootReducer from './reducers';
import Config from './config';

const logger = createLogger();
const config = new Config();
const middleware = [
  alias(aliases),
  thunkMiddleware,
  logger,
];
const composeEnhancers = composeWithDevTools({ realtime: true });
const store = createStore(rootReducer, {}, composeEnhancers(
  applyMiddleware(...middleware),
  batchedSubscribe(batchedUpdates),
));

wrapStore(store, {
  portName: 'maomao-extension',
});

// ctx menu handler
chrome.contextMenus.removeAll();
chrome.contextMenus.create({
  title: 'Login',
  contexts: ['browser_action'],
  id: 'mm-btn-login',
});

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
  store.dispatch({
    type: 'IM_SCORE',
    payload: {
      url,
      updateAt,
    },
  });
  if (window.sessionObservable.urls.get(url)) {
    store.dispatch({
      type: 'IM_ALLOWABLE',
      payload: {
        url,
        isOpen: true,
      },
    });
  } else {
    store.dispatch({
      type: 'IM_ALLOWABLE',
      payload: {
        url,
        isOpen: false,
      },
    });
  }
}

window.mobx.reaction(() => window.sessionObservable.activeUrl, (url) => {
  console.info('reaction url', url);
  const now = Date.now();
  checkImScore(url, now);
  if (window.sessionObservable.urls.get(url) && Number(window.userId) > 0) {
    const data = Object.assign({ saveAt: now }, window.mm_get_imscore(url), { userId: window.userId });
    window.ajax_put_UrlHistory(data,
      error => store.dispatch({
        type: 'IM_SAVE_ERROR',
        payload: {
          url,
          history: {
            data,
            error,
            saveAt: now,
          },
        },
      }),
      result => store.dispatch({
        type: 'IM_SAVE_SUCCESS',
        payload: {
          url,
          history: {
            data,
            result,
            saveAt: now,
          },
        },
      }));
  }
});

window.mobx.reaction(() => window.sessionObservable.updateAt, (updateAt) => {
  console.info('reaction updateAt', updateAt);
  const url = window.sessionObservable.activeUrl;
  checkImScore(url, updateAt);
});

// firebase auth
// init firebase
window.firebase.initializeApp({
  apiKey: config.firebaseKey,
  databaseURL: config.firebaseDB,
  storageBucket: config.firebaseStore,
});

function initFirebaseApp() {
  console.log('initFirebaseApp');
  // Listen for auth state changes.
  window.firebase.auth().onAuthStateChanged((user) => {
    console.log('firebase => User state change detected from the Background script of the Chrome Extension:', user);
  });
}

window.onload = () => {
  initFirebaseApp();
};
