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

  componentDidMount() {
    console.log('componentDidMount', this.chipInput);
    this.chipInput.focus();
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
          defaultValue={this.props.from}
          floatingLabelText="From: "
          disabled
          />
        <TextField
          defaultValue={this.props.subject}
          floatingLabelText="Subject"
          fullWidth
          onChange={this.changeSubject}
          />
        <ChipInput
          ref={(input) => { this.chipInput = input; }}
          fullWidth
          fullWidthInput
          autoFocus
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
          hintText="To: "
          onChange={this.handleChange}
          filter={AutoComplete.caseInsensitiveFilter}
          maxSearchResults={5}
          />
      </div>
    );
  }
}

GoogleContactPresenter.propTypes = {
  from: PropTypes.string.isRequired,
  subject: PropTypes.string.isRequired,
  contacts: PropTypes.array.isRequired,
  selectRecipient: PropTypes.func.isRequired,
  changeSubject: PropTypes.func.isRequired,
};

export default GoogleContactPresenter;
