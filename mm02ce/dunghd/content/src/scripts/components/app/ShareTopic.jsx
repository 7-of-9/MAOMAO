import React from 'react';
import { pure } from 'recompose';
import AutoComplete from 'material-ui/AutoComplete';
import ChipInput from 'material-ui-chip-input';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';

const style = {
  container: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000,
    width: '400px',
    height: '400px',
    backgroundColor: '#fff',
  },
  chip: {
    margin: 4,
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
};

const ShareTopic = pure(({ terms, contacts, handleChange }) =>
  <div style={style.container}>
    <h1 className="maomao-logo">
      maomao
    </h1>
    <ChipInput
      fullWidth
      fullWidthInput
      autoFocus
      dataSource={contacts}
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
  </div>,
);
export default pure(ShareTopic);
