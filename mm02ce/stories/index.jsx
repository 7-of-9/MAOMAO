import React from 'react';
/* eslint-disable */
import { storiesOf, action } from '@kadira/storybook';
/* eslint-enable */
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import WelcomeModal from '../dunghd/content/src/scripts/components/app/WelcomeModal';
import Score from '../dunghd/content/src/scripts/components/app/Score';

require('../dunghd/content/src/scripts/stylesheets/main.scss');

storiesOf('Welcome', module)
  .add('open for guest', () => (
    <MuiThemeProvider>
      <div id="maomao-extension-anchor">
        <WelcomeModal
          onFacebookLogin={action('onFacebookLogin')}
          onLogout={action('onLogout')}
          onClose={action('onClose')}
          isOpen
          auth={{
            isLogin: false,
            googleToken: '',
            facebookToken: '',
            info: {},
            contacts: [],
          }}
        />
      </div>
    </MuiThemeProvider>
  ))
  .add('open for user', () => (
    <MuiThemeProvider>
      <div id="maomao-extension-anchor">
        <WelcomeModal
          onFacebookLogin={action('onFacebookLogin')}
          onLogout={action('onLogout')}
          onClose={action('onClose')}
          isOpen
          auth={{
            isLogin: true,
            googleToken: '',
            facebookToken: '',
            info: {
              name: 'Dung Huynh',
              email: 'dunghd.it@gmail.com',
              picture: '',
            },
            contacts: [],
          }}
        />
      </div>
    </MuiThemeProvider>
  ));


storiesOf('Score', module)
  .add('with default props', () => (
    <MuiThemeProvider>
      <div id="maomao-extension-anchor">
        <Score
          score={{
            url: '',
            histories: [],
            time_on_tab: 0,
            audible_pings: 0,
            im_score: 0,
          }}
        />
      </div>
    </MuiThemeProvider>
  )).add('with props', () => (
    <MuiThemeProvider>
      <div id="maomao-extension-anchor">
        <Score
          score={{
            url: window.location.href,
            histories: [],
            time_on_tab: 10,
            audible_pings: 10,
            im_score: 10,
          }}
        />
      </div>
    </MuiThemeProvider>
  ));
