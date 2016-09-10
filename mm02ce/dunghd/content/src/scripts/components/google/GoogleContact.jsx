import React, { PropTypes } from 'react';
import GoogleContactPresenter from './GoogleContactPresenter';

const GoogleContact = ({ contacts, selectRecipient }) => (
  <div>
    <h3> Please select your friends to send invitation!</h3>
    <GoogleContactPresenter contacts={contacts} selectRecipient={selectRecipient} />
  </div>
);

GoogleContact.propTypes = {
  contacts: PropTypes.array.isRequired,
  selectRecipient: PropTypes.func.isRequired,
};

GoogleContact.defaultProps = {
  contacts: [],
};

export default GoogleContact;
