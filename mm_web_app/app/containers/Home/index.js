/*
 *
 * Home
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import Helmet from 'react-helmet';
import { NotificationStack } from 'react-notification';
import { OrderedSet } from 'immutable';
import { createStructuredSelector } from 'reselect';
import AppHeader from 'containers/AppHeader';
import YourStreams from 'components/YourStreams';
import StreamList from 'components/StreamList';
import Footer from 'components/Footer';
import { hasInstalledExtension } from 'utils/chrome';
import { isLogin, userId } from 'utils/simpleAuth';
import ChromeInstall from 'components/ChromeInstall';
import Loading from 'components/Loading';
import { userHistory, switchUser } from '../App/actions';
import { makeSelectUserHistory, makeSelectHomeLoading } from '../App/selectors';
import makeSelectHome from './selectors';
import { newInviteCode, acceptInviteCodes, changeTerm, changeFriendStream } from './actions';

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
    let id = userId();
    const { query, pathname } = this.props.location;

    if (query && query.close && query.close === 'popup') {
      window.close();
    }

    if (query && query.user_id && hasInstalledExtension()) {
      id = query.user_id;
      const hash = query.hash;
      this.props.dispatch(switchUser({ id, hash }));
      // TODO: support switch user or remove this code
    }

    if (pathname && pathname.length > 1) {
      this.props.dispatch(newInviteCode(pathname));
    }

    if (id > 0 && hasInstalledExtension()) {
      this.props.dispatch(userHistory(id));
      this.props.dispatch(acceptInviteCodes());
    }
  }

  onInstallSucess() {
    this.addNotification('Yeah! You have been installed maomao extension successfully.');
    setTimeout(() => {
      window.location.reload();
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
    let { currentTermId, friendStreamId } = this.props.home;
    const { me: { urls, topics }, shares: friends } = this.props.history.toJS();
    const sortedTopicByUrls = _.reverse(_.sortBy(_.filter(topics, (topic) => topic && topic.id > 0), [(topic) => topic.url_ids.length]));
    let selectedUrls = [];
    let urlIds = [];
    // set to first topic on first try
    if (friendStreamId === -1) {
      if (currentTermId === -1 && sortedTopicByUrls.length > 0) {
        currentTermId = sortedTopicByUrls[0].id;
        urlIds = sortedTopicByUrls[0].url_ids;
      } else {
        const currentTopic = sortedTopicByUrls.find((item) => item.id === currentTermId);
        if (currentTopic) {
          urlIds = currentTopic.url_ids;
        }
      }
      selectedUrls = _.filter(urls, (item) => item.id && urlIds.indexOf(item.id) !== -1);
    } else {
      const currentStream = friends.find((item) => item.id === friendStreamId);
      if (currentStream) {
        selectedUrls = currentStream.urls;
      }
    }

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
          <AppHeader />
          {
            !hasInstalledExtension() &&
            <div style={{ margin: '0 auto', padding: '5em' }}>
              <ChromeInstall title="Install Now!" install={this.inlineInstall} hasInstalled={hasInstalledExtension()} />
            </div>
          }
          {
            isLogin() &&
            <YourStreams
              friends={friends}
              topics={sortedTopicByUrls}
              activeId={currentTermId}
              changeTerm={this.props.changeTerm}
              changeFriendStream={this.props.changeFriendStream}
            />
          }
          <Loading isLoading={this.props.loading} />
          {
            isLogin() &&
            <StreamList urls={selectedUrls} />
          }
        </div>
        <div style={{ clear: 'both' }} />
        <Footer />
      </div>
    );
  }
}

Home.propTypes = {
  location: PropTypes.object,
  history: PropTypes.object,
  home: PropTypes.object,
  loading: PropTypes.bool,
  dispatch: PropTypes.func,
  changeTerm: PropTypes.func,
  changeFriendStream: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  home: makeSelectHome(),
  history: makeSelectUserHistory(),
  loading: makeSelectHomeLoading(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    changeTerm: (termId) => {
      dispatch(changeTerm(termId));
    },
    changeFriendStream: (termId) => {
      dispatch(changeFriendStream(termId));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
