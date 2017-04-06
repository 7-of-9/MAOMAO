/*
 *
 * Home
 *
 */

import React, { PropTypes } from 'react';
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
import { isLogin, userId } from 'utils/simpleAuth';
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
      const uuid = Date.now();
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
            const uuid = Date.now();
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
            const uuid = Date.now();
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
      let id = userId();
      const { query, pathname } = this.props.location;

      if (query && query.close && query.close === 'popup') {
        window.close();
      }

      if (query && query.user_id && hasInstalledExtension()) {
        id = query.user_id;
        const hash = query.hash;
        this.props.dispatch(switchUser({ id, hash }));
        this.props.addNotification(`TESTING MODE: switch to user ${id}`);
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
