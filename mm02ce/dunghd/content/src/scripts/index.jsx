import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'react-chrome-redux';
import * as log from 'loglevel';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import App from './components/app';
import Config from './config';

// NOTE: Expose global modules for content.js
/* eslint-disable */
require('expose-loader?justext!justext');
require('expose-loader?franc!franc');
require('expose-loader?StackTrace!stacktrace-js');
require('expose-loader?log!loglevel');

if (process.env.NODE_ENV !== 'production') {
  const { whyDidYouUpdate } = require('why-did-you-update');
  whyDidYouUpdate(React, { include: /^pure/, exclude: /^Connect/ });
}
/* eslint-enable */

if (process.env.NODE_ENV === 'production') {
  // This disables all logging below the given level
  log.setLevel('warn');
} else {
  log.setLevel('debug');
}

const config = new Config();
const proxyStore = new Store({ portName: 'maomao-extension' });
const anchor = document.createElement('div');
anchor.id = 'maomao-extension-anchor';

function isInjectAble(url) {
  const disableUrls = [
    'maomao-testing.firebaseapp.com', // firebase login
    'www.facebook.com/sharer.php', // fb share
    'www.facebook.com/dialog/send', // fb send msg
    'accounts.google.com', // gg login
  ];
  return disableUrls.filter(item => url.indexOf(item) === -1).length === disableUrls.length;
}

// turn off for firebase auth
const url = document.URL;
if (isInjectAble(url)) {
 document.body.insertBefore(anchor, document.body.childNodes[0]);
 injectTapEventPlugin();
 // wait for the store to connect to the background page
 proxyStore.ready().then(() => {
   render(
     <MuiThemeProvider>
       <Provider store={proxyStore}>
         <App {...config} />
       </Provider>
     </MuiThemeProvider>
     , document.getElementById('maomao-extension-anchor'));
 });
}
