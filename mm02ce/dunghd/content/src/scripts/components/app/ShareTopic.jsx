import React from 'react';
import { pure } from 'recompose';
import SelectSearch from 'react-select-search';

const style = {
  container: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000,
    width: '400px',
    height: '400px',
    backgroundColor: '#dedede',
    border: '3px solid #3f51b5',
  },
  topic: {
    fontWeight: 'bolder',
  },
  heading: {
    paddingLeft: '50px',
    fontSize: '20px',
    lineHeight: '40px',
    height: '50px',
  },
  chip: {
    margin: 4,
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
};

const selectTopics = terms => terms && terms[0] && terms[0].text;
const contactsSource = contacts => contacts.map((item) => {
  const object = {
    name: `${item.name} (${item.email})`,
    value: item.email,
  };
  return object;
}) || [];

const ShareTopic = pure(({ terms, contacts, handleChange, sendEmails }) =>
  <div style={style.container}>
    <div className="maomao-logo" />
    <h3 style={style.heading}>
      Share <span style={style.topic}>{selectTopics(terms)}</span> with:
    </h3>
    <SelectSearch
      multiple
      height={250}
      options={contactsSource(contacts)}
      onChange={handleChange}
      name="emails"
      placeholder="To:"
    />
    <a className="share-button" onClick={sendEmails}>Share Now</a>
  </div >,
);
export default pure(ShareTopic);
