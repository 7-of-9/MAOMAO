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
require('expose?justext!justext');
/* eslint-enable */

const config = new Config();
const proxyStore = new Store({ portName: 'maomao-extension' });
const anchor = document.createElement('div');
anchor.id = 'maomao-extension-anchor';

console.info('config', config);
document.body.insertBefore(anchor, document.body.childNodes[0]);

injectTapEventPlugin();

const unsubscribe = proxyStore.subscribe(() => {
  unsubscribe(); // make sure to only fire once
  render(
    <MuiThemeProvider>
      <Provider store={proxyStore}>
        <App {...config} />
      </Provider>
    </MuiThemeProvider>
    , document.getElementById('maomao-extension-anchor'));
});
