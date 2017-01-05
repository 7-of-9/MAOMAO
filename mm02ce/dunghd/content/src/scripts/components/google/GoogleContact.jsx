import React, { PropTypes } from 'react';
import GoogleContactPresenter from './GoogleContactPresenter';

const customStyles = {
  title: {
    textAlign: 'center',
    margin: ' 0px 0px -1px',
    padding: '12px 12px 10px',
    color: '#000',
    fontSize: '16px',
    lineHeight: '2px',
    fontWeight: '400',
    borderBottom: '1px solid rgb(224, 224, 224)',
  },
  content: {
    textAlign: 'center',
  },
};

const GoogleContact = ({ from, subject, contacts, selectRecipient, changeSubject }) => (
  <div style={customStyles.content}>
    <GoogleContactPresenter
      from={from}
      subject={subject}
      contacts={contacts}
      selectRecipient={selectRecipient}
      changeSubject={changeSubject}
      />
  </div>
);

GoogleContact.propTypes = {
  from: PropTypes.string.isRequired,
  subject: PropTypes.string.isRequired,
  contacts: PropTypes.array.isRequired,
  selectRecipient: PropTypes.func.isRequired,
  changeSubject: PropTypes.func.isRequired,
};

GoogleContact.defaultProps = {
  contacts: [],
  selected: [],
};

export default GoogleContact;
