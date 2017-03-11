/*
 *
 * Extension
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
// import { browserHistory } from 'react-router';
import { createStructuredSelector } from 'reselect';
import { intlShape, injectIntl } from 'react-intl';
import { StickyContainer, Sticky } from 'react-sticky';
import { NotificationStack } from 'react-notification';
import { OrderedSet } from 'immutable';
import Helmet from 'react-helmet';
import Header from 'components/Header';
import LogoIcon from 'components/LogoIcon';
import Slogan from 'components/Slogan';
import ChromeInstall from 'components/ChromeInstall';
import FriendStream from 'components/FriendStream';
import Footer from 'components/Footer';

import makeSelectExtension from './selectors';
import messages from './messages';

/* global chrome */

function hasInstalledExtension() {
  return document.getElementById('maomao-extension-anchor') !== null || chrome.app.isInstalled;
}

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
    // browserHistory.push('/');
    // FIXME: hack to homepage
    window.location.href = 'https://maomao-demo.herokuapp.com/';
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
      <StickyContainer style={{ width: '960px', margin: '0 auto' }}>
        <Helmet
          title="extension"
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
        <Sticky style={{ zIndex: 100, backgroundColor: '#fff' }}>
          <Header>
            <LogoIcon />
            <Slogan />
          </Header>
        </Sticky>
        {query && query.from &&
          <FriendStream name={query.from} topic={query.stream} />
        }
        <div style={{ margin: '0 auto', padding: '1em' }}>
          <ChromeInstall title={formatMessage(messages.unlock)} install={this.inlineInstall} hasInstalled={hasInstalledExtension()} />
        </div>
        <h4 style={{ display: hasInstalledExtension() ? 'none' : '', margin: '0 auto', padding: '1em', textAlign: 'center', fontStyle: 'italic' }}>
          Install maomao in your browser to view {query && query.from && `${query.from}'s shared`} topic!
        </h4>
        <Footer />
      </StickyContainer>
    );
  }
}

Extension.propTypes = {
  location: PropTypes.any,
  intl: intlShape.isRequired,
  // dispatch: PropTypes.func.isRequired,
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
