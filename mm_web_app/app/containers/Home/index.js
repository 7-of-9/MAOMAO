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
import { isLogin, userId } from 'utils/simpleAuth';
import ChromeInstall from 'components/ChromeInstall';
import Loading from 'components/Loading';

import { userHistory, switchUser } from '../App/actions';
import { makeSelectUserHistory, makeSelectHomeLoading } from '../App/selectors';
import makeSelectHome from './selectors';
import { changeTerm, changeSubTerm, acceptInviteCode } from './actions';

function selectTopics(termId, topics) {
  if (termId > 0) {
    // find root
    let topic = _.find(topics, { term_id: Number(termId) });
    if (topic) {
      return topic;
    }
    for (let counter = 0; counter < topics.length; counter += 1) {
      const currentTopic = topics[counter];
      if (currentTopic.child_topics && currentTopic.child_topics.length) {
        topic = selectTopics(termId, currentTopic.child_topics);
        if (topic) {
          return topic;
        }
      }
    }
    return topic;
  }
  return {};
}

function selectUrls(ids, urls) {
  if (ids && ids.length > 0) {
    return _.filter(urls, (item) => ids.indexOf(item.id) !== -1);
  }
  return [];
}


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
    if (query && query.user_id) {
      id = query.user_id;
      this.props.dispatch(switchUser(id));
    }

    if (id > 0) {
      this.props.dispatch(userHistory(id));
      if (pathname && pathname.length > 1) {
        this.props.dispatch(acceptInviteCode(pathname));
      }
    }
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
    const friends = hasInstalledExtension() && isLogin() ? [{ name: 'Dung', userId: 2 }, { name: 'Dominic', userId: 5 }, { name: 'Winston', userId: 1 }] : [];
    const { topics, urls } = this.props.history.toJS();
    const { currentTermId, breadcrumbs } = this.props.home;
    let termId;
    if (breadcrumbs && breadcrumbs.length) {
      termId = breadcrumbs[breadcrumbs.length - 1].termId;
    }
    const currentTopic = selectTopics(termId || currentTermId, topics);
    let navPath = '';
    // build breadcrumbs path
    if (breadcrumbs && breadcrumbs.length) {
      const navPaths = [];
      _.forEach(breadcrumbs, (path) => {
        navPaths.push(path.parentName);
      });
      navPaths.push(breadcrumbs[breadcrumbs.length - 1].termName);
      navPath = navPaths.join(' > ');
    } else {
      navPath = currentTopic && currentTopic.term_name;
    }
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
          <AppHeader breadcrumb={navPath} friends={friends} />
          {
            !hasInstalledExtension() &&
            <div style={{ margin: '0 auto', padding: '5em' }}>
              <ChromeInstall title="Install Now!" install={this.inlineInstall} hasInstalled={hasInstalledExtension()} />
            </div>
          }
          <YourStreams breadcrumbs={breadcrumbs} activeTermId={currentTermId} topics={topics} topic={currentTopic} change={this.props.changeTerm} />
          <StreamList change={this.props.changeSubTerm} topic={currentTopic} urls={currentUrls} />
        </div>
        <div style={{ clear: 'both' }} />
        <Loading isLoading={this.props.loading} />
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
  changeSubTerm: PropTypes.func,
  changeTerm: PropTypes.func,
  dispatch: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  home: makeSelectHome(),
  history: makeSelectUserHistory(),
  loading: makeSelectHomeLoading(),
});

function mapDispatchToProps(dispatch) {
  return {
    changeTerm: (termId) => {
      dispatch(changeTerm(termId));
    },
    changeSubTerm: (termId) => {
      dispatch(changeSubTerm(termId));
    },
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
