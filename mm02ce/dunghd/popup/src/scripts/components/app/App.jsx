import React, { PureComponent, PropTypes } from 'react';
import { connect } from 'react-redux';

const propTypes = {
  auth: PropTypes.object,
};

const defaultProps = {
  auth: {
    isLogin: false,
    accessToken: '',
    info: {},
    contacts: [],
  },
};

class App extends PureComponent {
  render() {
    return (
      <div>
        Hello {this.props.auth.info.name}
      </div>
    );
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(App);
