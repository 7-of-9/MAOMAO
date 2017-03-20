import React, { PropTypes } from 'react';
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

class App extends React.PureComponent {
  render() {
    return (
      <div style={{ width: '200px' }}>
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
