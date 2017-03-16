/*
 *
 * Hiring
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

export class Hiring extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        We are hiring
      </div>
    );
  }
}

Hiring.propTypes = {
  dispatch: PropTypes.func.isRequired,
};


function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(null, mapDispatchToProps)(Hiring);
