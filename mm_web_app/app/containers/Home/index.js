/*
 *
 * Home
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { StickyContainer, Sticky } from 'react-sticky';
import Header from 'components/Header';
import LogoIcon from 'components/LogoIcon';
import Slogan from 'components/Slogan';
import Footer from 'components/Footer';
import GoogleLogin from 'react-google-login';

import {
   googleConnect, googleConnectLoadingError,
} from '../App/actions';

import makeSelectHome from './selectors';

export class Home extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <StickyContainer style={{ width: '960px', margin: '0 auto' }}>
        <Helmet
          title="Homepage"
          meta={[
            { name: 'description', content: 'Maomao extension' },
          ]}
        />
        <Sticky style={{ zIndex: 100, backgroundColor: '#fff' }}>
          <Header>
            <LogoIcon />
            <Slogan />
            <div style={{ position: 'absolute', top: '50px', right: '40px' }}>
              <GoogleLogin
                clientId="323116239222-b2n8iffvc5ljb71eoahs1k72ee8ulbd7.apps.googleusercontent.com"
                buttonText="Connect with Google"
                onSuccess={this.props.onGoogleSuccess}
                onFailure={this.props.onGoogleFailure}
              />
            </div>
          </Header>
        </Sticky>
        <Footer />
      </StickyContainer>
    );
  }
}

Home.propTypes = {
  onGoogleSuccess: PropTypes.func.isRequired,
  onGoogleFailure: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  Home: makeSelectHome(),
});

function mapDispatchToProps(dispatch) {
  return {
    onGoogleSuccess: (response) => {
      dispatch(googleConnect(response));
    },
    onGoogleFailure: (error) => {
      dispatch(googleConnectLoadingError(error));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
