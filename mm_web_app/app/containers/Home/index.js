/*
 *
 * Home
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import _ from 'lodash';
import { NotificationStack } from 'react-notification';
import { OrderedSet } from 'immutable';
import { createStructuredSelector } from 'reselect';
import AppHeader from 'containers/AppHeader';
import YourStreams from 'components/YourStreams';
import StreamList from 'components/StreamList';
import Footer from 'components/Footer';
import { hasInstalledExtension } from 'utils/chrome';
import ChromeInstall from 'components/ChromeInstall';

import { userHistory } from '../App/actions';
import { makeSelectUserHistory } from '../App/selectors';
import makeSelectHome from './selectors';
import { changeTerm } from './actions';

function selectTopics(termId, topics) {
  if (termId > 0) {
    return _.find(topics, { term_id: Number(termId) });
  }
  return {};
}

function selectUrls(ids, urls) {
  if (ids && ids.length > 0) {
    return _.filter(urls, (item) => ids.indexOf(item.id) !== -1);
  }
  return [];
}

const friends = hasInstalledExtension() ? [{ name: 'Dung', userId: 2 }, { name: 'Dominic', userId: 5 }, { name: 'Winston', userId: 1 }] : [];

export class Home extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  constructor(props) {
    super(props);
    this.state = {
      notifications: OrderedSet(),
      count: 0,
    };
    this.onInstallSucess = this.onInstallSucess.bind(this);
    this.onInstallFail = this.onInstallFail.bind(this);
    this.inlineInstall = this.inlineInstall.bind(this);
    this.addNotification = this.addNotification.bind(this);
    this.removeNotification = this.removeNotification.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(userHistory());
  }

  onInstallSucess() {
    this.addNotification('Yeah! You have been installed maomao extension successfully. You will be redirected to homepage.');
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  }

  onInstallFail(error) {
    this.addNotification(error);
  }

  /* global chrome */
  inlineInstall() {
    chrome.webstore.install(
        'https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk',
        this.onInstallSucess,
        this.onInstallFail);
  }

  addNotification(msg) {
    const uuid = Date.now();
    return this.setState({
      notifications: this.state.notifications.add({
        message: msg,
        key: uuid,
        action: 'Dismiss',
        onClick: (deactivate) => {
          this.removeNotification(deactivate.key);
        },
      }),
    });
  }

  removeNotification(uuid) {
    const notifications = this.state.notifications.filter((item) => item.key !== uuid);
    this.setState({
      notifications,
    });
  }

  render() {
    const { topics, urls } = this.props.history.toJS();
    const { currentTermId } = this.props.home;
    const currentTopic = selectTopics(currentTermId, topics);
    const currentUrls = selectUrls(currentTopic.url_ids, urls);
    return (
      <div style={{ width: '100%', margin: '0 auto' }}>
        <Helmet
          title="Homepage"
          meta={[
            { name: 'description', content: 'Maomao extension' },
          ]}
        />
        <div style={{ zIndex: 100 }}>
          <NotificationStack
            notifications={this.state.notifications.toArray()}
            dismissAfter={5000}
            onDismiss={(notification) => this.setState({
              notifications: this.state.notifications.delete(notification),
            })}
          />
          <AppHeader friends={friends} />
          {
            !hasInstalledExtension() &&
            <div style={{ margin: '0 auto', padding: '5em' }}>
              <ChromeInstall title="Install Now!" install={this.inlineInstall} hasInstalled={hasInstalledExtension()} />
            </div>
          }
          <YourStreams activeTermId={currentTermId} topics={topics} change={this.props.changeTerm} />
          <StreamList topic={currentTopic} urls={currentUrls} />
        </div>
        <div style={{ clear: 'both' }} />
        <Footer />
      </div>
    );
  }
}

Home.propTypes = {
  history: PropTypes.object,
  home: PropTypes.object,
  changeTerm: PropTypes.func,
  dispatch: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  home: makeSelectHome(),
  history: makeSelectUserHistory(),
});

function mapDispatchToProps(dispatch) {
  return {
    changeTerm: (termId) => {
      dispatch(changeTerm(termId));
    },
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
