import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import FacebookButton from './FacebookButton';
import FacebookMessengerButton from './FacebookMessengerButton';
import TwitterButton from './TwitterButton';
import LinkButton from './LinkButton';

const propTypes = { auth: PropTypes.object };
const defaultProps = { auth: {
  isLogin: false,
  accessToken: '',
  info: {},
  contacts: [],
} };
const App = () => <div style={{ width: '250px', minHeight: '100px' }} >
  <h3>Share this topic</h3>
  <div>
    <FacebookButton />
    <TwitterButton />
    <FacebookMessengerButton />
    <LinkButton />
  </div>
</div>;

App.propTypes = propTypes;
App.defaultProps = defaultProps;

const mapStateToProps = state => ({ auth: state.auth });
export default connect(mapStateToProps)(App);
