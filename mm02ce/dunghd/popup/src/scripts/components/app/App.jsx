import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose, withHandlers, withState, pure } from 'recompose';
import FacebookButton from './FacebookButton';
import FacebookMessengerButton from './FacebookMessengerButton';
import GoogleButton from './GoogleButton';
import LinkButton from './LinkButton';

const propTypes = {
  activeUrl: PropTypes.func,
  auth: PropTypes.object,
  nlp: PropTypes.object,
  onReady: PropTypes.func,
 };
const defaultProps = {
  activeUrl: () => {},
  auth: {
    isLogin: false,
    accessToken: '',
    info: {},
    contacts: [],
  },
  nlp: {
    nlps: [],
    texts: [],
    scores: [],
    terms: [],
    records: [],
  },
  onReady: () => {},
};

const isAllowToShare = (url, records) => {
  if (records && records.length) {
    const isExist = records.filter(item => item.url === url);
    return isExist.length > 0;
  }
  return false;
};

const render = (isLogin, nlp, url) => {
  if (isLogin) {
    if (isAllowToShare(url, nlp.records)) {
      return (
        <div>
          <h3>Share this topic</h3>
          <div>
            <GoogleButton />
            <FacebookButton />
            <FacebookMessengerButton />
            <LinkButton />
          </div>
        </div>
      );
    }
    return 'This site is not ready to share!';
  }
  return 'Please login to see the magic :)';
};

const App = ({ auth, nlp, activeUrl, onReady }) => <div style={{ width: '250px', minHeight: '100px' }} >
  {onReady()}
  {render(auth.isLogin, nlp, activeUrl)}
</div>;

App.propTypes = propTypes;
App.defaultProps = defaultProps;

const enhance = compose(
  withState('url', 'activeUrl', ''),
  withHandlers({
    onReady: props => () => {
      console.warn('onReady', props);
      if (props.auth.isLogin) {
        chrome.tabs.query({
          active: true,
          currentWindow: true,
        }, (tabs) => {
          if (tabs != null && tabs.length > 0) {
            const url = tabs[0].url;
            if (url !== props.url) {
              props.activeUrl(url);
            }
          }
        });
      }
    },
  }),
  pure,
);

const mapStateToProps = state => ({ auth: state.auth, nlp: state.nlp });
export default connect(mapStateToProps)(enhance(App));
