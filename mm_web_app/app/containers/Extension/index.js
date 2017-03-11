/*
 *
 * Extension
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { intlShape, injectIntl } from 'react-intl';
import { NotificationStack } from 'react-notification';
import { OrderedSet } from 'immutable';
import Helmet from 'react-helmet';
import AppHeader from 'containers/AppHeader';
import ChromeInstall from 'components/ChromeInstall';
import FriendStream from 'components/FriendStream';
import Footer from 'components/Footer';
import { hasInstalledExtension } from 'utils/chrome';

import makeSelectExtension from './selectors';
import messages from './messages';

/* global chrome */

export class Extension extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  constructor() {
    super();
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

  onInstallSucess() {
    this.addNotification('Yeah! You have been installed maomao extension successfully. You will be redirected to homepage.');
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  }

  onInstallFail(error) {
    this.addNotification(error);
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

  inlineInstall() {
    chrome.webstore.install(
      'https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk',
      this.onInstallSucess,
      this.onInstallFail);
  }

  removeNotification(uuid) {
    const notifications = this.state.notifications.filter((item) => item.key !== uuid);
    this.setState({
      notifications,
    });
  }


  render() {
    const { query } = this.props.location;
    const { formatMessage } = this.props.intl;
    return (
      <div style={{ width: '960px', margin: '0 auto' }}>
        <Helmet
          title="Maomao Extension"
          meta={[
            { name: 'description', content: 'Maomao extension' },
          ]}
        />
        <NotificationStack
          notifications={this.state.notifications.toArray()}
          dismissAfter={5000}
          onDismiss={(notification) => this.setState({
            notifications: this.state.notifications.delete(notification),
          })}
        />
        <AppHeader friends={[]} />
        {query && query.from &&
          <FriendStream name={query.from} topic={query.stream} />
        }
        <div style={{ margin: '0 auto', padding: '5em' }}>
          <ChromeInstall title={query.from ? formatMessage(messages.unlock) : formatMessage(messages.install)} install={this.inlineInstall} hasInstalled={hasInstalledExtension()} />
        </div>
        <h4 style={{ display: hasInstalledExtension() ? 'none' : '', margin: '0 auto', padding: '1em', textAlign: 'center', fontStyle: 'italic' }}>
          Install maomao in your browser to view {query && query.from && `${query.from}'s shared`} topic!
        </h4>
        <Footer />
      </div>
    );
  }
}

Extension.propTypes = {
  location: PropTypes.any,
  intl: intlShape.isRequired,
};

const mapStateToProps = createStructuredSelector({
  Extension: makeSelectExtension(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Extension));
