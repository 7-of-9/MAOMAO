import React, { PropTypes } from 'react';
import HelloModal from '../modal';

const propTypes = {
  count: PropTypes.number,
  dispatch: PropTypes.func,
};

const defaultProps = {
  count: 0,
};

const App = ({ count }) => (
  <div>
    <HelloModal />
    Count: {count}
    <br />
  </div>
);

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default App;
