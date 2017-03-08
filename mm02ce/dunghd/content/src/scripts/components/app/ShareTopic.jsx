import React from 'react';
import { pure, withState, compose } from 'recompose';
import ChipInput from 'material-ui-chip-input';
import AutoComplete from 'material-ui/AutoComplete';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';

const style = {
  container: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000,
    minWidth: '400px',
    maxHeight: '400px',
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
  button: {
    float: 'right',
    textAlign: 'center',
  },
  chip: {
    margin: 4,
  },
  wrapper: {
    overflow: 'auto',
    maxHeight: '300px',
  },
};

const selectTopics = terms => terms && terms[0] && terms[0].text;
const contactsSource = contacts => contacts.map((item) => {
  const object = {
    text: item.name ? `${item.name} (${item.email})` : item.email,
    name: item.name,
    email: item.email,
  };
  return object;
}) || [];

const enhance = compose(
  withState('show', 'setDisplay', true),
  pure,
);

const ShareTopic = enhance(({
  show, enable, setDisplay, terms, contacts, handleChange, sendEmails }) =>
  <div style={Object.assign({}, style.container, { display: show && enable ? '' : 'none' })}>
    <div className="maomao-logo" />
    <a onClick={() => setDisplay(() => false)} className="close_button" />
    <h3 style={style.heading}>
      Share <span style={style.topic}>{selectTopics(terms)}</span> with:
    </h3>
    <ChipInput
      fullWidth
      fullWidthInput
      autoFocus
      style={style.wrapper}
      dataSource={contactsSource(contacts)}
      dataSourceConfig={{ text: 'text', value: 'email' }}
      chipRenderer={({ value, text, isFocused, isDisabled, handleClick, handleRequestDelete }, key) => (
        <Chip
          style={style.chip}
          key={key}
          onTouchTap={handleClick}
          onRequestDelete={handleRequestDelete}
        >
          <Avatar size={32}>{value[0].toUpperCase()}</Avatar>
          {text}
        </Chip>
      )}
      hintText="To: "
      onChange={handleChange}
      filter={AutoComplete.caseInsensitiveFilter}
      maxSearchResults={5}
    />
    <a style={style.button} className="share-button" onClick={sendEmails}>Share Now!</a>
  </div >,
);
export default ShareTopic;
