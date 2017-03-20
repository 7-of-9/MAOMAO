import React from 'react';
import { render } from 'react-dom';
import { Store } from 'react-chrome-redux';
import { Provider } from 'react-redux';
import App from './components/app/App';

const proxyStore = new Store({
  portName: 'maomao-extension',
});

// wait for the store to connect to the background page
proxyStore.ready().then(() => {
  render(
    <Provider store={proxyStore}><App /></Provider>
    , document.getElementById('app'));
});
