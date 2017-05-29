import React from 'react';
import { StyleRoot } from 'radium';
/* eslint-disable */
import { storiesOf, action } from '@kadira/storybook';
/* eslint-enable */
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import WelcomeModal from '../dunghd/content/src/scripts/components/app/WelcomeModal';
import Score from '../dunghd/content/src/scripts/components/app/Score';
import Xp from '../dunghd/content/src/scripts/components/app/Xp';
import ShareOnHoverImage from '../dunghd/content/src/scripts/components/app/ShareOnHoverImage';
import PulseDog from '../dunghd/content/src/scripts/components/app/PulseDog';
import GoogleShare from '../dunghd/content/src/scripts/components/share/GoogleShare';
import Loading from '../dunghd/popup/src/scripts/components/app/Loading';

require('../dunghd/content/src/scripts/stylesheets/main.scss');

injectTapEventPlugin();

storiesOf('Welcome', module)
  .add('open for guest', () => (
    <div id="maomao-extension-anchor">
      <MuiThemeProvider>
        <StyleRoot>
          <div className="maomao-ext-component">
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
        </StyleRoot>
      </MuiThemeProvider>
    </div>
  ))
  .add('open for user', () => (
    <div id="maomao-extension-anchor">
      <MuiThemeProvider>
        <StyleRoot>
          <div className="maomao-ext-component">
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
        </StyleRoot>
      </MuiThemeProvider>
    </div>
  ));


storiesOf('Score', module)
  .add('with default props', () => (
    <div id="maomao-extension-anchor">
      <MuiThemeProvider>
        <StyleRoot>
          <div className="maomao-ext-component">
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
        </StyleRoot>
      </MuiThemeProvider>
    </div>
  )).add('with props', () => (
    <div id="maomao-extension-anchor">
      <MuiThemeProvider>
        <StyleRoot>
          <div className="maomao-ext-component">
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
        </StyleRoot>
      </MuiThemeProvider>
    </div>
  ));

storiesOf('Xp', module).add(
  'with tld topic', () => (
    <div id="maomao-extension-anchor">
      <MuiThemeProvider>
        <StyleRoot>
          <div className="maomao-ext-component">
            <Xp
              shareTopics={action('shareTopics')}
              closeXp={action('closeXp')}
              terms={[{ text: 'Test TLD', score: 10 }]}
            />
          </div>
        </StyleRoot>
      </MuiThemeProvider>
    </div>
  ))
  .add('with 2 xp topics', () => (
    <div id="maomao-extension-anchor">
      <MuiThemeProvider>
        <StyleRoot>
          <div className="maomao-ext-component">
            <Xp
              shareTopics={action('shareTopics')}
              closeXp={action('closeXp')}
              terms={[{ text: 'Test Xp 1', score: 20 }, { text: 'Test Xp 2', score: 30 }]}
              isEnableExperimentalTopics
            />
          </div>
        </StyleRoot>
      </MuiThemeProvider>
    </div>
  ),
);

storiesOf('GoogleShare', module).add('with default props', () => (
  <div id="maomao-extension-anchor">
    <MuiThemeProvider>
      <StyleRoot>
        <div className="maomao-ext-component">
          <GoogleShare
            mostRecentUses={[]}
            contacts={[]}
            handleChange={action('handleChange')}
          />
        </div>
      </StyleRoot>
    </MuiThemeProvider>
  </div>
));

storiesOf('Loading', module).add('for share popup', () => (
  <div id="maomao-extension-anchor">
    <MuiThemeProvider>
      <StyleRoot>
        <div className="maomao-ext-component">
          <Loading />
        </div>
      </StyleRoot>
    </MuiThemeProvider>
  </div>
));


storiesOf('Share On Hover Image', module).add('on the top left', () => (
  <div id="maomao-extension-anchor">
    <StyleRoot>
      <div className="maomao-ext-component">
        <div>
          <img width="300" height="200" src="http://lorempixel.com/300/200/nature" alt="nature" />
        </div>
        <div>
          <img width="300" height="200" src="http://lorempixel.com/300/200/city" alt="city" />
        </div>
        <ShareOnHoverImage openShare={action('openShare')} isReady />
      </div>
    </StyleRoot>
  </div>
));

storiesOf('Pulse Dog', module).add('animate and close in 5s', () => (
  <div id="maomao-extension-anchor">
    <StyleRoot>
      <div className="maomao-ext-component">
        <PulseDog openShare={action('openShare')} hideOnTimer={5000} isReady />
      </div>
    </StyleRoot>
  </div>
));
