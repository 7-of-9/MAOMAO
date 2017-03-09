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

import makeSelectHome from './selectors';

const responseGoogle = (response) => {
  console.log('responseGoogle', response);
};


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
                onSuccess={responseGoogle}
                onFailure={responseGoogle}
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
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  Home: makeSelectHome(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
