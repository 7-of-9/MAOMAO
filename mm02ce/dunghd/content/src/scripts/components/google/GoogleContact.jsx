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

const GoogleContact = ({ contacts, selected, selectRecipient, loadMore, page, totalPages }) => (
  <div style={customStyles.content}>
    <h3 style={customStyles.title}> Please select your friends to send invitation!</h3>
    <GoogleContactPresenter
      page={page}
      totalPages={totalPages}
      loadMore={loadMore}
      contacts={contacts}
      selected={selected}
      selectRecipient={selectRecipient}
      />
  </div>
);

GoogleContact.propTypes = {
  contacts: PropTypes.array.isRequired,
  selected: PropTypes.array.isRequired,
  selectRecipient: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  loadMore: PropTypes.func.isRequired,
};

GoogleContact.defaultProps = {
  contacts: [],
  selected: [],
};

export default GoogleContact;
