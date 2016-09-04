import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'react-chrome-redux';
import axios from 'axios';

import App from './components/app';
import Config from './config';

const config = new Config();
const proxyStore = new Store({ portName: 'maomao-extension' });
const anchor = document.createElement('div');
anchor.id = 'rcr-anchor';

// Handle API request errors
axios.interceptors.response.use(response => response, error => (
  new Promise((resolve, reject) => {
    if (error.status === 401
      && error.data.error_description === 'The access token provided has expired.') {
      // refresh token or just ask user again
    } else if (error.status === 401 && error.statusText === 'Unauthorized') {
      // logout
    } else {
      reject(error);
    }
  })
));


console.info('config', config);
document.body.insertBefore(anchor, document.body.childNodes[0]);
render(
  <Provider store={proxyStore}>
    <App {...config} />
  </Provider>
  , document.getElementById('rcr-anchor'));
