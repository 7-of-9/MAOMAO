import React, { Component, PropTypes } from 'react';
import ChipInput from 'material-ui-chip-input';
import AutoComplete from 'material-ui/AutoComplete';
import TextField from 'material-ui/TextField';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';

const styles = {
  chip: {
    margin: 4,
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
};


class GoogleContactPresenter extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.changeSubject = this.changeSubject.bind(this);
  }

  changeSubject(event) {
    this.props.changeSubject(event.target.value);
  }

  handleChange(emails) {
    console.log('handleChange', emails);
    this.props.selectRecipient(emails.map(item => item.email));
  }

  render() {
    return (
      <div style={styles.wrapper}>
        <TextField
          hintText={'Welcome to MaoMao Extension'}
          floatingLabelText={'Subject'}
          fullWidth
          onChange={this.changeSubject}
          />
        <ChipInput
          fullWidth
          fullWidthInput
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          targetOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          dataSource={this.props.contacts}
          dataSourceConfig={{ text: 'name', value: 'email' }}
          chipRenderer={({ value, text, isFocused, isDisabled, handleClick, handleRequestDelete }, key) => (
            <Chip
              style={styles.chip}
              key={key}
              onTouchTap={handleClick}
              onRequestDelete={handleRequestDelete}
              >
              <Avatar size={32}>{value[0].toUpperCase()}</Avatar>
              {text}
            </Chip>
          )}
          onChange={this.handleChange}
          filter={AutoComplete.fuzzyFilter}
          maxSearchResults={5}
          openOnFocus
          />
      </div>
    );
  }
}

GoogleContactPresenter.propTypes = {
  contacts: PropTypes.array.isRequired,
  selectRecipient: PropTypes.func.isRequired,
  changeSubject: PropTypes.func.isRequired,
};

export default GoogleContactPresenter;
