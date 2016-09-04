import React, { PropTypes } from 'react';

const GoogleLoginPresenter = ({ clientId }) => (
  <div>
    clientId: {clientId}
  </div>
);

GoogleLoginPresenter.propTypes = {
  clientId: PropTypes.string,
};

export default GoogleLoginPresenter;
