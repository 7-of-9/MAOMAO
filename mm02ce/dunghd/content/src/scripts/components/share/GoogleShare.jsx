import React, { PropTypes } from 'react';
import ChipInput from 'material-ui-chip-input';
import AutoComplete from 'material-ui/AutoComplete';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';

const style = {
  chip: { margin: 4 },
  wrapper: { overflow: 'auto', maxHeight: '300px' },
};
const propTypes = {
  contacts: PropTypes.array,
  handleChange: PropTypes.func.isRequired,
};
const defaultProps = { contacts: [] };

const contactsSource = contacts => contacts.map(
  (item) => {
    const object = {
      text: item.name ? `${item.name} (${item.email})` : item.email,
      name: item.name,
      email: item.email,
    };
    return object;
  },
) || [];

const GoogleShare = ({ contacts, handleChange }) => <ChipInput
  fullWidth
  fullWidthInput
  autoFocus
  style={style.wrapper}
  dataSource={contactsSource(contacts)}
  dataSourceConfig={{ text: 'text', value: 'email' }}
  chipRenderer={(
    { value, text, isFocused, isDisabled, handleClick, handleRequestDelete },
    key,
  ) => (
    <Chip
      style={style.chip}
      key={key}
      onTouchTap={handleClick}
      onRequestDelete={handleRequestDelete}
    >
      <Avatar size={32}>{value[0].toUpperCase()}</Avatar>
      {text}
    </Chip>)}
  hintText="To: "
  onChange={handleChange}
  filter={AutoComplete.caseInsensitiveFilter}
  maxSearchResults={5}
/>;

GoogleShare.propTypes = propTypes;
GoogleShare.defaultProps = defaultProps;

export default GoogleShare;
