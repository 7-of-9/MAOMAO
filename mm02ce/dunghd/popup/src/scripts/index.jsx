import React from 'react';
import { render } from 'react-dom';
import { Store } from 'react-chrome-redux';
import { Provider } from 'react-redux';
import StackTrace from 'stacktrace-js';
import * as logger from 'loglevel';
import App from './components/app/App';

if (process.env.NODE_ENV === 'production') {
  // This disables all logging below the given level
  logger.setLevel('error');
} else {
  logger.setLevel('debug');
}

/* eslint-disable */
if (process.env.NODE_ENV !== 'production') {
  const { whyDidYouUpdate } = require('why-did-you-update');
  whyDidYouUpdate(React, {
    exclude: /^(Connect|StyleRoot|Dropdown|DropdownTrigger|Autosuggest|ItemsList|Item|Step|CopyToClipboard|TouchRipple|EnhancedButton|IconButton|Card|CardActions|Avatar|CardHeader|Paper|styled|onlyUpdateForKeys|withHandlers|withState|lifecycle)/
  });
}
/* eslint-enable */

// ERROR handler
const errBack = (err) => { logger.error(err.message); };

const errorStackTracking = (stackframes) => {
  const stringifiedStack = stackframes.map(sf => sf.toString()).join('\n');
  logger.warn('error stack', stringifiedStack);
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
