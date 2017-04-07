/*
 *
 * Home
 *
 */

import React, { PropTypes } from 'react';
import { browserHistory } from 'react-router';
import { compose, withState, withHandlers, lifecycle, onlyUpdateForKeys } from 'recompose';
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
import { isLogin, userId, userHash, userEmail } from 'utils/simpleAuth';
import { guid } from 'utils/hash';
import ChromeInstall from 'components/ChromeInstall';
import Loading from 'components/Loading';
import { userHistory, switchUser } from '../App/actions';
import { makeSelectUserHistory, makeSelectHomeLoading } from '../App/selectors';
import makeSelectHome from './selectors';
import { newInviteCode, acceptInviteCodes, changeTerm, changeFriendStream } from './actions';

function Home({ home, history, notifications, loading,
  inlineInstall, changeNotifications, onChangeTerm, onChangeFriendStream }) {
  let { currentTermId } = home;
  const { friendStreamId } = home;
  const { me: { urls, topics }, shares: friends } = history.toJS();
  const sortedTopicByUrls = _.reverse(_.sortBy(_.filter(topics, (topic) => topic && topic.term_id > 0), [(topic) => topic.url_ids.length]));
  let selectedUrls = [];
  let urlIds = [];
  // set to first topic on first try
  if (friendStreamId === -1) {
    if (currentTermId === -1 && sortedTopicByUrls.length > 0) {
      currentTermId = sortedTopicByUrls[0].term_id;
      urlIds = sortedTopicByUrls[0].url_ids;
    } else {
      const currentTopic = sortedTopicByUrls.find((item) => item.term_id === currentTermId);
      if (currentTopic) {
        urlIds = currentTopic.url_ids;
      }
    }
    selectedUrls = _.filter(urls, (item) => item.id && urlIds.indexOf(item.id) !== -1);
  } else {
    const currentStream = friends.find((item) => item.user_id === friendStreamId);
    if (currentStream) {
      selectedUrls = _.uniq(_.flatten(currentStream.list.map((item) => item.urls)));
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
          notifications={notifications.toArray()}
          dismissAfter={5000}
          onDismiss={(notification) => changeNotifications(() => notifications.delete(notification))}
        />
        <AppHeader />
        {
          !hasInstalledExtension() &&
          <div style={{ margin: '0 auto', padding: '5em' }}>
            <ChromeInstall title="Install Now!" install={inlineInstall} hasInstalled={hasInstalledExtension()} />
          </div>
        }
        {
          isLogin() &&
          <YourStreams
            friends={friends}
            topics={sortedTopicByUrls}
            activeId={currentTermId}
            changeTerm={onChangeTerm}
            changeFriendStream={onChangeFriendStream}
          />
        }
        <Loading isLoading={loading} />
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

Home.propTypes = {
  history: PropTypes.object,
  home: PropTypes.object,
  loading: PropTypes.bool,
  notifications: PropTypes.object,
  changeNotifications: PropTypes.func,
  inlineInstall: PropTypes.func,
  onChangeTerm: PropTypes.func,
  onChangeFriendStream: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  home: makeSelectHome(),
  history: makeSelectUserHistory(),
  loading: makeSelectHomeLoading(),
});

const enhance = compose(
  withState('notifications', 'changeNotifications', OrderedSet()),
  withHandlers({
    onChangeTerm: (props) => (termId) => {
      props.dispatch(changeTerm(termId));
    },
    onChangeFriendStream: (props) => (termId) => {
      props.dispatch(changeFriendStream(termId));
    },
    addNotification: (props) => (msg) => {
      const uuid = guid();
      props.changeNotifications((notifications) => notifications.add({
        message: msg,
        key: uuid,
        action: 'Dismiss',
        onClick: (deactivate) => {
          props.changeNotifications((allNotifications) => allNotifications.filter((item) => item.key !== deactivate.key));
        },
      }));
    },
    inlineInstall: (props) => () => {
      /* global chrome */
      chrome.webstore.install(
          'https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk',
          () => {
            const msg = 'Yeah! You have been installed maomao extension successfully.';
            const uuid = guid();
            props.changeNotifications((notifications) => notifications.add({
              message: msg,
              key: uuid,
              action: 'Dismiss',
              onClick: (deactivate) => {
                props.changeNotifications((allNotifications) => allNotifications.filter((item) => item.key !== deactivate.key));
              },
            }));
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          },
          (msg) => {
            const uuid = guid();
            props.changeNotifications((notifications) => notifications.add({
              message: msg,
              key: uuid,
              action: 'Dismiss',
              onClick: (deactivate) => {
                props.changeNotifications((allNotifications) => allNotifications.filter((item) => item.key !== deactivate.key));
              },
            }));
          });
    },
  }),
  lifecycle({
    componentDidMount() {
      const id = userId();
      const { query, pathname } = this.props.location;

      if (query && query.close && query.close === 'popup') {
        window.close();
      }

      if (query && query.user_id && hasInstalledExtension()) {
        const { user_id, hash, email } = query;
        const currentUserId = userId();
        const currentUserHash = userHash();
        const currentUserEmail = userEmail();
        this.props.dispatch(switchUser({ userId: user_id, hash, email }));
        const msg = 'TESTING MODE: switch user';
        const uuid = guid();
        this.props.changeNotifications((notifications) => notifications.add({
          message: msg,
          key: uuid,
          action: 'Revert back',
          dismissAfter: false,
          onClick: (deactivate) => {
            this.props.dispatch(switchUser({ userId: currentUserId, hash: currentUserHash, email: currentUserEmail }));
            this.props.changeNotifications((allNotifications) => allNotifications.filter((item) => item.key !== deactivate.key));
            this.props.addNotification('You are back to homepage!');
            browserHistory.goBack('');
          },
        }));
      }

      if (pathname && pathname.length > 1) {
        this.props.dispatch(newInviteCode(pathname));
      }

      if (id > 0 && hasInstalledExtension()) {
        this.props.dispatch(userHistory(id));
        this.props.addNotification('Loading user history data...');
        this.props.dispatch(acceptInviteCodes());
      }
    },
  }),
  onlyUpdateForKeys(['home', 'history', 'loading', 'notifications']),
);


export default connect(mapStateToProps)(enhance(Home));
