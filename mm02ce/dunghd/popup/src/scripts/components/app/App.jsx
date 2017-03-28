import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose, withHandlers, withState, lifecycle, pure } from 'recompose';
import FacebookButton from './FacebookButton';
import FacebookMessengerButton from './FacebookMessengerButton';
import GoogleButton from './GoogleButton';
import LinkButton from './LinkButton';
import processUrl from './utils';

const propTypes = {
  url: PropTypes.string,
  auth: PropTypes.object,
  nlp: PropTypes.object,
  dispatch: PropTypes.func,
};

const defaultProps = {
  url: '',
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
  dispatch: () => {},
};
const isAllowToShare = (url, records) => {
  if (records && records.length) {
    const isExist = records.filter(item => item.url === url);
    return isExist.length > 0;
  }

  return false;
};
const render = (isLogin, nlp, url, dispatch) => {
  if (isLogin) {
    if (url && processUrl(url)) {
      if (isAllowToShare(url, nlp.records)) {
        return (
          <div>
            <h3>Share this topic</h3>
            <div>
              <GoogleButton
                onClick={() => {
                dispatch({ type: 'MAOMAO_ENABLE', payload: { url } });
                dispatch({ type: 'OPEN_SHARE_MODAL', payload: { url, type: 'Google' } });
              }}
              />
              <FacebookButton
                onClick={() => {
                  dispatch({ type: 'MAOMAO_ENABLE', payload: { url } });
                  dispatch({ type: 'OPEN_SHARE_MODAL', payload: { url, type: 'Facebook' } });
                }}
              />
              <FacebookMessengerButton
                onClick={() => {
                    dispatch({ type: 'MAOMAO_ENABLE', payload: { url } });
                    dispatch({ type: 'OPEN_SHARE_MODAL', payload: { url, type: 'FacebookMessenger' } });
                  }}
              />
              <LinkButton
                onClick={() => {
                  dispatch({ type: 'MAOMAO_ENABLE', payload: { url } });
                  dispatch({ type: 'OPEN_SHARE_MODAL', payload: { url, type: 'Link' } });
              }}
              />
            </div>
          </div>
        );
      }
      // TODO: check on site is allowable or not
      return (
        <div>
          This site is not ready to sharing. Please wait in a few mins for processing this site!
        </div>);
    }
    return (
      <div>
        Maomao sharing is off on this tab!
      </div>);
  }
  return (
    <div>
      Please login to see the magic :)
    </div>);
};

const App = (
  { auth, nlp, url, dispatch },
) => <div
  style={{ margin: '0 auto' }}
>
  {render(auth.isLogin, nlp, url, dispatch)}
</div>;

App.propTypes = propTypes;
App.defaultProps = defaultProps;
const enhance = compose(
  withState('url', 'activeUrl', ''),
  withHandlers({
    onReady: props => () => {
      if (props.auth && props.auth.isLogin) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
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
  lifecycle({
    componentDidMount() {
      this.props.onReady();
    },
  }),
  pure,
);

const mapStateToProps = state => ({ auth: state.auth, nlp: state.nlp });
export default connect(mapStateToProps)(enhance(App));
