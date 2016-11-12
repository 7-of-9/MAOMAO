import React, { Component, PropTypes } from 'react';
import ChipInput from 'material-ui-chip-input';
import AutoComplete from 'material-ui/AutoComplete';
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
  }

  handleChange(emails) {
    console.log('handleChange', emails);
    this.props.selectRecipient(emails.map(item => item.email));
  }

  render() {
    return (
      <div style={styles.wrapper}>
        <ChipInput
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
              {text}({value})
          </Chip>
          )}
          onChange={this.handleChange}
          filter={AutoComplete.fuzzyFilter}
          fullWidth
          openOnFocus
          />
      </div>
    );
  }
}

GoogleContactPresenter.propTypes = {
  contacts: PropTypes.array.isRequired,
  selectRecipient: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  loadMore: PropTypes.func.isRequired,
};

export default GoogleContactPresenter;
