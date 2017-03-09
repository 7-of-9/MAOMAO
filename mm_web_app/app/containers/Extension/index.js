/*
 *
 * Extension
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { intlShape, injectIntl } from 'react-intl';
import { StickyContainer, Sticky } from 'react-sticky';
import Helmet from 'react-helmet';
import Header from 'components/Header';
import LogoIcon from 'components/LogoIcon';
import Slogan from 'components/Slogan';
import ChromeInstall from 'components/ChromeInstall';
import FriendStream from 'components/FriendStream';
import UnlockNow from 'components/UnlockNow';

import makeSelectExtension from './selectors';
import messages from './messages';

export class Extension extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
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
        <Sticky style={{ zIndex: 100, backgroundColor: '#fff' }}>
          <Header>
            <LogoIcon />
            <Slogan />
            <ChromeInstall />
          </Header>
        </Sticky>
        {query && query.from &&
          <FriendStream name={query.from} topic={query.stream} />
        }
        <UnlockNow title={formatMessage(messages.unlock)} />
      </StickyContainer>
    );
  }
}

Extension.propTypes = {
  dispatch: PropTypes.func.isRequired,
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
