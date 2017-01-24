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
import { saveImScore, checkImScore } from './imscore';

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

window.sessionObservable = mobx.observable({
    urls: mobx.observable.map({}),
    icons: mobx.observable.map({}),
    activeUrl: '',
});

mobx.reaction(() => window.sessionObservable.activeUrl, (activeUrl) => {
    console.info('reaction url', activeUrl);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs != null && tabs.length > 0) {
            let url = activeUrl;
            if (tabs[0] && tabs[0].url && url !== tabs[0].url) {
                url = tabs[0].url;
                console.info('reaction url - active tab', url);
            }
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
                    saveImScore(window.sessionObservable, window.ajax_put_UrlHistory, store, url, Number(window.userId));
                }
            }
        }
    });
});

// save im_score every 30 seconds
const ROUND_CLOCK = 30;
setInterval(() => {
    // TODO: Should send data when its changes
    const url = window.sessionObservable.activeUrl;
    if (Number(window.userId) > 0) {
        console.log('Save im_score every ', ROUND_CLOCK, ' seconds', url);
        saveImScore(window.sessionObservable, window.ajax_put_UrlHistory, store, url, Number(window.userId));
    }
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
        // TODO: Auto login
        console.log('firebase => User state change detected from the Background script of the Chrome Extension:', user);
    });
}

window.onload = () => {
    initFirebaseApp();
};
