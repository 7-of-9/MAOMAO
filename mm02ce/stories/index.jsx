import React from 'react';
/* eslint-disable */
import { storiesOf, action } from '@kadira/storybook';
/* eslint-enable */
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import WelcomeModal from '../dunghd/content/src/scripts/components/app/WelcomeModal';
import Score from '../dunghd/content/src/scripts/components/app/Score';
import Xp from '../dunghd/content/src/scripts/components/app/Xp';
import ShareOnHoverImage from '../dunghd/content/src/scripts/components/app/ShareOnHoverImage';
import GoogleShare from '../dunghd/content/src/scripts/components/share/GoogleShare';
import Loading from '../dunghd/popup/src/scripts/components/app/Loading';

require('../dunghd/content/src/scripts/stylesheets/main.scss');

injectTapEventPlugin();

storiesOf('Welcome', module)
  .add('open for guest', () => (
    <div id="maomao-extension-anchor">
      <MuiThemeProvider>
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
      </MuiThemeProvider>
    </div>
  ))
  .add('open for user', () => (
    <div id="maomao-extension-anchor">
      <MuiThemeProvider>
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
      </MuiThemeProvider>
    </div>
  ));


storiesOf('Score', module)
  .add('with default props', () => (
    <div id="maomao-extension-anchor">
      <MuiThemeProvider>
        <Score
          score={{
            url: '',
            histories: [],
            time_on_tab: 0,
            audible_pings: 0,
            im_score: 0,
          }}
        />
      </MuiThemeProvider>
    </div>
  )).add('with props', () => (
    <div id="maomao-extension-anchor">
      <MuiThemeProvider>
        <Score
          score={{
            url: window.location.href,
            histories: [],
            time_on_tab: 10,
            audible_pings: 10,
            im_score: 10,
          }}
        />
      </MuiThemeProvider>
    </div>
  ));

storiesOf('Xp', module).add(
  'with tld topic', () => (
    <div id="maomao-extension-anchor">
      <MuiThemeProvider>
        <Xp
          shareTopics={action('shareTopics')}
          closeXp={action('closeXp')}
          terms={[{ text: 'Test TLD', score: 10 }]}
        />
      </MuiThemeProvider>
    </div>
  ))
  .add('with 2 xp topics', () => (
    <div id="maomao-extension-anchor">
      <MuiThemeProvider>
        <Xp
          shareTopics={action('shareTopics')}
          closeXp={action('closeXp')}
          terms={[{ text: 'Test Xp 1', score: 20 }, { text: 'Test Xp 2', score: 30 }]}
          isEnableExperimentalTopics
        />
      </MuiThemeProvider>
    </div>
  ),
);

storiesOf('GoogleShare', module).add('with default props', () => (
  <div id="maomao-extension-anchor">
    <MuiThemeProvider>
      <GoogleShare
        mostRecentUses={[]}
        contacts={[]}
        handleChange={action('handleChange')}
      />
    </MuiThemeProvider>
  </div>
));

storiesOf('Loading', module).add('for share popup', () => (
  <div id="maomao-extension-anchor">
    <MuiThemeProvider>
      <Loading />
    </MuiThemeProvider>
  </div>
));


storiesOf('Share On Hover Image', module).add('with default props', () => (
  <div id="maomao-extension-anchor">
    <MuiThemeProvider>
      <div>
        <img src="http://lorempixel.com/600/400/nature" alt="nature" />
        <img src="http://lorempixel.com/600/400/city" alt="city" />
        <ShareOnHoverImage openShare={action('openShare')} isReady />
      </div>
    </MuiThemeProvider>
  </div>
));
