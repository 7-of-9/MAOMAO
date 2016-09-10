import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'react-chrome-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import App from './components/app';
import Config from './config';

const config = new Config();
const proxyStore = new Store({ portName: 'maomao-extension' });
const anchor = document.createElement('div');
anchor.id = 'rcr-anchor';

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
    , document.getElementById('rcr-anchor'));
});
