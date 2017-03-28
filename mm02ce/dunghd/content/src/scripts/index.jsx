import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'react-chrome-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import App from './components/app';
import Config from './config';

// NOTE: Expose global modules for content.js
/* eslint-disable */
require('expose-loader?justext!justext');
require('expose-loader?franc!franc');
require('expose-loader?StackTrace!stacktrace-js');
/* eslint-enable */

const config = new Config();
const proxyStore = new Store({ portName: 'maomao-extension' });
const anchor = document.createElement('div');
anchor.id = 'maomao-extension-anchor';

// turn off for firebase auth
const url = document.URL;
/* eslint-disable no-console */
console.log('inject maomao app on url', url);
if (url.indexOf('maomao-testing.firebaseapp.com') === -1 && url.indexOf('accounts.google.com') === -1) {
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
