import React from 'react';
import { render } from 'react-dom';
import { Store } from 'react-chrome-redux';
import { Provider } from 'react-redux';
import StackTrace from 'stacktrace-js';
import App from './components/app/App';

/* eslint-disable */
if (process.env.NODE_ENV !== 'production') {
  const { whyDidYouUpdate } = require('why-did-you-update');
  whyDidYouUpdate(React, { include: /^pure/, exclude: /^Connect/ });
}
/* eslint-enable */

/* eslint-disable no-alert, no-console */
// ERROR handler
const errBack = (err) => { console.log(err.message); };

const errorStackTracking = (stackframes) => {
    const stringifiedStack = stackframes.map(sf => sf.toString()).join('\n');
    console.warn('error stack', stringifiedStack);
};

window.onerror = (msg, file, line, col, error) => {
  StackTrace.fromError(error).then(errorStackTracking).catch(errBack);
};

const proxyStore = new Store({ portName: 'maomao-extension' });

// wait for the store to connect to the background page
proxyStore.ready().then(() => {
  render(
    <Provider store={proxyStore}><App /></Provider>,
    document.getElementById('app'),
  );
});
